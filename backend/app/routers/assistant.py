from fastapi import APIRouter

from app.assistant.ollama import chat_with_ollama, probe_ollama
from app.assistant.tools import handle_user_message
from app.schemas.assistant import (
    AssistantChatRequest,
    AssistantChatResponse,
    AssistantStatusResponse,
)

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


@router.get("/status", response_model=AssistantStatusResponse)
def assistant_status() -> AssistantStatusResponse:
    probed = probe_ollama()
    return AssistantStatusResponse(
        api=True,
        ollama=bool(probed.get("ollama")),
        model=str(probed.get("model") or "llama3.2"),
    )


@router.post("/chat", response_model=AssistantChatResponse)
def chat(payload: AssistantChatRequest) -> AssistantChatResponse:
    latest = payload.messages[-1].content if payload.messages else ""
    local = handle_user_message(latest, payload.intake, payload.currency)
    if latest.strip().startswith("/"):
        return AssistantChatResponse(
            reply=local.reply,
            source="command",
            reset=local.reset,
        )

    history = [{"role": item.role, "content": item.content} for item in payload.messages]
    remote = chat_with_ollama(history, payload.intake, payload.currency)
    if remote:
        return AssistantChatResponse(reply=remote, source="ollama")
    return AssistantChatResponse(reply=local.reply, source="fallback")
