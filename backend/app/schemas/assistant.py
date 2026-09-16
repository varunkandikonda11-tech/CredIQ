from pydantic import BaseModel
from typing import Literal

from app.schemas.score import IntakeAnswers

Currency = Literal["USD", "INR"]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class AssistantChatRequest(BaseModel):
    messages: list[ChatMessage]
    intake: IntakeAnswers
    currency: Currency = "USD"


class AssistantChatResponse(BaseModel):
    reply: str
    source: Literal["command", "ollama", "fallback"] = "fallback"
    reset: bool = False


class AssistantStatusResponse(BaseModel):
    api: bool = True
    ollama: bool = False
    model: str = "llama3.2"
