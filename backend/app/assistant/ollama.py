from __future__ import annotations

import json
import os

import httpx

from app.assistant.tools import (
    handle_user_message,
    tool_explain_factor,
    tool_faq,
    tool_get_breakdown,
    tool_simulate,
)
from app.config import OLLAMA_BASE_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT_SECONDS
from app.schemas.score import IntakeAnswers

SYSTEM_PROMPT = """You are CreditIQ, an excellent credit-education assistant for a hackathon demo.
Rules:
- Never invent numeric scores, factor points, or what-if deltas. Call tools.
- The AUTHORITATIVE SCORE STATE in this prompt is ground truth.
- The borrower score is a FICO-style estimate (300 + five factors totaling 550), not a bureau FICO.
- Income is not in the borrower score. USD is canonical; INR display uses 1 USD = 96 INR.
- Lender ML predicts 2-year default risk; do not mix it with the five FICO-style bars.
- Be concrete, numbered, and short. If asked for FAQ, use the faq tool.
"""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_breakdown",
            "description": "Return the current five-factor score breakdown.",
            "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "simulate",
            "description": "Rescore after a named what-if scenario.",
            "parameters": {
                "type": "object",
                "properties": {
                    "scenario": {
                        "type": "string",
                        "enum": ["payoff", "miss", "wait", "open", "close", "max"],
                    }
                },
                "required": ["scenario"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "explain_factor",
            "description": "Explain one FICO-style factor for this user.",
            "parameters": {
                "type": "object",
                "properties": {
                    "key": {
                        "type": "string",
                        "enum": [
                            "paymentHistory",
                            "utilization",
                            "creditAge",
                            "creditMix",
                            "newCredit",
                        ],
                    }
                },
                "required": ["key"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "faq",
            "description": "Return CreditIQ FAQ text.",
            "parameters": {
                "type": "object",
                "properties": {"topic": {"type": "string"}},
            },
        },
    },
]


def _dispatch_tool(name: str, arguments: dict, intake: IntakeAnswers) -> str:
    if name == "get_breakdown":
        return json.dumps(tool_get_breakdown(intake))
    if name == "simulate":
        return json.dumps(tool_simulate(intake, str(arguments.get("scenario", "payoff"))))
    if name == "explain_factor":
        return json.dumps(tool_explain_factor(intake, str(arguments.get("key", "utilization"))))
    if name == "faq":
        topic = arguments.get("topic")
        return tool_faq(str(topic) if topic else None)
    return json.dumps({"error": f"unknown tool {name}"})


def _extract_tool_calls(message: dict) -> list[dict]:
    calls = message.get("tool_calls") or []
    if calls:
        return calls
    content = message.get("content") or ""
    if "<tool_call>" in content:
        return []
    return []


def chat_with_ollama(
    messages: list[dict[str, str]],
    intake: IntakeAnswers,
    currency: str,
) -> str | None:
    latest = messages[-1]["content"] if messages else ""
    parsed = handle_user_message(latest, intake, currency)
    if latest.strip().startswith("/"):
        return parsed.reply

    breakdown = json.dumps(tool_get_breakdown(intake))
    system = (
        SYSTEM_PROMPT
        + f"\nAUTHORITATIVE SCORE STATE ({currency}):\n{breakdown}"
    )
    payload_messages: list[dict] = [{"role": "system", "content": system}]
    payload_messages.extend(messages)

    url = os.getenv("OLLAMA_BASE_URL", OLLAMA_BASE_URL).rstrip("/") + "/chat/completions"
    model = os.getenv("OLLAMA_MODEL", OLLAMA_MODEL)
    timeout = OLLAMA_TIMEOUT_SECONDS

    try:
        with httpx.Client(timeout=timeout) as client:
            for _ in range(3):
                response = client.post(
                    url,
                    json={
                        "model": model,
                        "messages": payload_messages,
                        "tools": TOOLS,
                        "temperature": 0.2,
                    },
                )
                response.raise_for_status()
                message = response.json()["choices"][0]["message"]
                tool_calls = _extract_tool_calls(message)
                if not tool_calls:
                    content = (message.get("content") or "").strip()
                    return content or parsed.reply
                payload_messages.append(message)
                for call in tool_calls:
                    function = call.get("function") or {}
                    name = function.get("name") or ""
                    raw_args = function.get("arguments") or "{}"
                    try:
                        arguments = json.loads(raw_args) if isinstance(raw_args, str) else raw_args
                    except json.JSONDecodeError:
                        arguments = {}
                    result = _dispatch_tool(name, arguments, intake)
                    payload_messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": call.get("id") or name,
                            "content": result,
                        }
                    )
    except (httpx.HTTPError, KeyError, IndexError, json.JSONDecodeError):
        return None
    return None


def probe_ollama() -> dict:
    base = os.getenv("OLLAMA_BASE_URL", OLLAMA_BASE_URL).rstrip("/")
    tags_url = base.replace("/v1", "") + "/api/tags"
    model = os.getenv("OLLAMA_MODEL", OLLAMA_MODEL)
    try:
        with httpx.Client(timeout=2.0) as client:
            response = client.get(tags_url)
            response.raise_for_status()
            names = [
                item.get("name", "")
                for item in response.json().get("models", [])
            ]
            reachable = any(model in name for name in names) or len(names) > 0
            return {
                "api": True,
                "ollama": reachable,
                "model": model,
                "installed": names[:8],
            }
    except (httpx.HTTPError, KeyError, json.JSONDecodeError):
        return {"api": True, "ollama": False, "model": model, "installed": []}
