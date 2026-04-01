import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


def get_llm(temperature: float = 0.7) -> ChatGroq:
    """Return a configured Groq LLM instance."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set in environment variables")

    model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    return ChatGroq(
        api_key=api_key,
        model=model,
        temperature=temperature,
    )


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
