from pydantic import BaseModel
from typing import Optional


class Message(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str


class SmartReplyRequest(BaseModel):
    messages: list[Message]
    context: Optional[str] = None


class SmartReplyResponse(BaseModel):
    replies: list[str]


class SummarizeRequest(BaseModel):
    messages: list[Message]


class SummarizeResponse(BaseModel):
    summary: str


class TranslateRequest(BaseModel):
    text: str
    target_language: str
    source_language: Optional[str] = "auto"


class TranslateResponse(BaseModel):
    translated_text: str
    detected_language: Optional[str] = None


class SentimentRequest(BaseModel):
    text: str


class SentimentResponse(BaseModel):
    sentiment: str          # positive | negative | neutral
    score: float            # 0.0 – 1.0
    emoji: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[list[Message]] = []
    system_prompt: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    history: list[Message]
