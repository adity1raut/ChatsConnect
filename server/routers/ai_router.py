from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage, SystemMessage
from anthropic import BadRequestError, AuthenticationError, PermissionDeniedError


def _handle_anthropic_error(e: Exception) -> HTTPException:
    """Convert Anthropic API errors to meaningful HTTP responses."""
    if isinstance(e, AuthenticationError):
        return HTTPException(status_code=401, detail="Invalid Anthropic API key.")
    if isinstance(e, PermissionDeniedError):
        return HTTPException(status_code=403, detail="Anthropic API key lacks permission.")
    if isinstance(e, BadRequestError):
        msg = str(e)
        if "credit balance is too low" in msg:
            return HTTPException(
                status_code=402,
                detail="Anthropic account has insufficient credits. Please add credits at console.anthropic.com/settings/billing."
            )
        return HTTPException(status_code=400, detail=msg)
    return HTTPException(status_code=500, detail=str(e))

from models.schemas import (
    SmartReplyRequest, SmartReplyResponse,
    SummarizeRequest, SummarizeResponse,
    TranslateRequest, TranslateResponse,
    SentimentRequest, SentimentResponse,
    ChatRequest, ChatResponse,
)
from services.llm_service import get_llm, get_fast_llm, build_langchain_messages
from services.agent_service import run_agent

router = APIRouter(prefix="/ai", tags=["AI"])


# ── Health ────────────────────────────────────────────────────────────────────

@router.get("/health")
async def health():
    return {"status": "ok", "service": "ChatConnect AI"}


# ── Smart Reply ───────────────────────────────────────────────────────────────

@router.post("/smart-reply", response_model=SmartReplyResponse)
async def smart_reply(body: SmartReplyRequest):
    """Generate 3 short smart reply suggestions for the last message in a conversation."""
    try:
        llm = get_fast_llm(temperature=0.8)

        # Summarise recent messages into context
        context_lines = "\n".join(
            f"{m.role.capitalize()}: {m.content}" for m in body.messages[-8:]
        )

        prompt = (
            "You are a messaging assistant. Based on the conversation below, "
            "generate exactly 3 short, natural reply suggestions (max 12 words each). "
            "Return ONLY a JSON array of 3 strings, nothing else.\n\n"
            f"Conversation:\n{context_lines}\n\n"
            "Suggestions (JSON array):"
        )

        response = await llm.ainvoke([HumanMessage(content=prompt)])
        raw = response.content.strip()

        # Parse JSON array robustly
        import json, re
        match = re.search(r'\[.*?\]', raw, re.DOTALL)
        if match:
            replies = json.loads(match.group())
        else:
            # Fallback: split lines
            replies = [line.strip().strip('"').strip("'") for line in raw.split('\n') if line.strip()]

        replies = [r for r in replies if r][:3]
        while len(replies) < 3:
            replies.append("Sounds good!")

        return SmartReplyResponse(replies=replies)
    except Exception as e:
        raise _handle_anthropic_error(e)


# ── Summarize ─────────────────────────────────────────────────────────────────

@router.post("/summarize", response_model=SummarizeResponse)
async def summarize(body: SummarizeRequest):
    """Summarize a conversation into 2–3 sentences."""
    try:
        llm = get_llm(temperature=0.3)

        conversation = "\n".join(
            f"{m.role.capitalize()}: {m.content}" for m in body.messages
        )

        prompt = (
            "Summarize the following conversation in 2–3 concise sentences. "
            "Focus on the key topics and decisions made.\n\n"
            f"Conversation:\n{conversation}\n\nSummary:"
        )

        response = await llm.ainvoke([HumanMessage(content=prompt)])
        return SummarizeResponse(summary=response.content.strip())
    except Exception as e:
        raise _handle_anthropic_error(e)


# ── Translate ─────────────────────────────────────────────────────────────────

@router.post("/translate", response_model=TranslateResponse)
async def translate(body: TranslateRequest):
    """Translate text to the specified target language."""
    try:
        llm = get_fast_llm(temperature=0.1)

        detect_note = (
            "Detect the source language and include it at the end on its own line as: DETECTED: <language>"
            if body.source_language == "auto"
            else f"Source language: {body.source_language}"
        )

        prompt = (
            f"Translate the following text to {body.target_language}. "
            f"{detect_note}\n"
            "Return ONLY the translated text (and the DETECTED line if auto-detecting).\n\n"
            f"Text: {body.text}"
        )

        response = await llm.ainvoke([HumanMessage(content=prompt)])
        raw = response.content.strip()

        detected = None
        translated = raw
        if "DETECTED:" in raw:
            parts = raw.rsplit("DETECTED:", 1)
            translated = parts[0].strip()
            detected = parts[1].strip()

        return TranslateResponse(translated_text=translated, detected_language=detected)
    except Exception as e:
        raise _handle_anthropic_error(e)


# ── Sentiment ─────────────────────────────────────────────────────────────────

@router.post("/sentiment", response_model=SentimentResponse)
async def sentiment(body: SentimentRequest):
    """Analyse the sentiment of a message."""
    try:
        llm = get_fast_llm(temperature=0.1)

        prompt = (
            "Analyse the sentiment of the following message. "
            "Reply with ONLY a JSON object with fields: "
            '"sentiment" (positive|negative|neutral), "score" (0.0-1.0), "emoji" (one emoji).\n\n'
            f'Message: "{body.text}"\n\nJSON:'
        )

        response = await llm.ainvoke([HumanMessage(content=prompt)])
        raw = response.content.strip()

        import json, re
        match = re.search(r'\{.*?\}', raw, re.DOTALL)
        if match:
            data = json.loads(match.group())
        else:
            data = {"sentiment": "neutral", "score": 0.5, "emoji": "😐"}

        return SentimentResponse(
            sentiment=data.get("sentiment", "neutral"),
            score=float(data.get("score", 0.5)),
            emoji=data.get("emoji", "😐"),
        )
    except Exception as e:
        raise _handle_anthropic_error(e)


# ── AI Chat Agent (LangGraph) ─────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest):
    """Chat with the ChatConnect AI assistant (backed by a LangGraph agent)."""
    try:
        history_dicts = [m.model_dump() for m in (body.history or [])]
        reply, new_history = await run_agent(
            user_message=body.message,
            history=history_dicts,
            system_prompt=body.system_prompt,
        )
        from models.schemas import Message
        return ChatResponse(
            reply=reply,
            history=[Message(**m) for m in new_history],
        )
    except Exception as e:
        raise _handle_anthropic_error(e)
