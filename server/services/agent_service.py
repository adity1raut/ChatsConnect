"""
LangGraph-based AI agent for the ChatConnect assistant.

Graph structure:
  START → agent → (tool_call?) → tools → agent → END
"""
from typing import Annotated
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END, START
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict

from services.llm_service import get_llm


# ── Tool definitions ──────────────────────────────────────────────────────────

@tool
def get_current_time() -> str:
    """Return the current UTC date and time."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    return now.strftime("%Y-%m-%d %H:%M UTC")


@tool
def word_count(text: str) -> str:
    """Count the number of words in the provided text."""
    count = len(text.split())
    return f"The text contains {count} word(s)."


TOOLS = [get_current_time, word_count]

# ── Graph state ───────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]


# ── Build the graph ───────────────────────────────────────────────────────────

def _build_graph():
    llm = get_llm(temperature=0.6).bind_tools(TOOLS)

    async def agent_node(state: AgentState):
        response = await llm.ainvoke(state["messages"])
        return {"messages": [response]}

    def should_continue(state: AgentState):
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            return "tools"
        return END

    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(TOOLS))
    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "agent")

    return graph.compile()


_AGENT_GRAPH = None


def get_agent_graph():
    global _AGENT_GRAPH
    if _AGENT_GRAPH is None:
        _AGENT_GRAPH = _build_graph()
    return _AGENT_GRAPH


CHATCONNECT_SYSTEM = (
    "You are ChatBot, an intelligent assistant built into ChatConnect — a real-time messaging platform. "
    "You help users draft messages, answer questions, summarise conversations, and more. "
    "Be concise, friendly, and helpful. Never make up information."
)


async def run_agent(user_message: str, history: list[dict], system_prompt: str | None = None) -> tuple[str, list[dict]]:
    """
    Run the LangGraph agent and return (reply_text, updated_history).
    history is a list of {"role": ..., "content": ...} dicts.
    """
    graph = get_agent_graph()
    system = system_prompt or CHATCONNECT_SYSTEM

    messages = [SystemMessage(content=system)]
    for msg in history:
        role = msg.get("role")
        content = msg.get("content", "")
        if role == "user":
            messages.append(HumanMessage(content=content))
        elif role == "assistant":
            messages.append(AIMessage(content=content))

    messages.append(HumanMessage(content=user_message))

    result = await graph.ainvoke({"messages": messages})

    # Extract the final assistant reply (last AI message with no tool calls)
    reply = ""
    for msg in reversed(result["messages"]):
        if isinstance(msg, AIMessage) and not (hasattr(msg, "tool_calls") and msg.tool_calls):
            reply = msg.content
            break

    new_history = list(history) + [
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": reply},
    ]
    return reply, new_history
