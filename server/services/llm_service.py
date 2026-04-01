import os
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


def _make_llm(model_env_key: str, default_model: str, temperature: float) -> ChatAnthropic:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError("ANTHROPIC_API_KEY is not set in environment variables")
    model = os.getenv(model_env_key, default_model)
    return ChatAnthropic(
        api_key=api_key,
        model=model,
        temperature=temperature,
        max_tokens=4096,
    )


def get_llm(temperature: float = 0.7) -> ChatAnthropic:
    """Sonnet — general purpose: chat agent, summarize, translate."""
    return _make_llm("ANTHROPIC_MODEL", "claude-sonnet-4-6", temperature)


def get_fast_llm(temperature: float = 0.7) -> ChatAnthropic:
    """Haiku — fast & cheap: smart reply, sentiment analysis."""
    return _make_llm("ANTHROPIC_FAST_MODEL", "claude-haiku-4-5-20251001", temperature)


def build_langchain_messages(history: list[dict], system_prompt: str | None = None) -> list:
    """Convert dict-based message history to LangChain message objects."""
    result = []
    if system_prompt:
        result.append(SystemMessage(content=system_prompt))
    for msg in history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            result.append(HumanMessage(content=content))
        elif role == "assistant":
            result.append(AIMessage(content=content))
        elif role == "system":
            result.append(SystemMessage(content=content))
    return result
