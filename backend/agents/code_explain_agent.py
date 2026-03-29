"""
Code Explanation Assistant Agent
LangGraph workflow: detect_language → analyze_structure → generate_explanation → summarize
"""
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from utils.groq_client import get_groq_llm


# ─── State ──────────────────────────────────────────────────────────────────

class CodeExplainState(TypedDict):
    code: str
    language_hint: str
    detected_language: str
    structure_analysis: str
    detailed_explanation: str
    summary: str


# ─── Nodes ──────────────────────────────────────────────────────────────────

def detect_language_node(state: CodeExplainState) -> dict:
    llm = get_groq_llm(temperature=0.0)
    messages = [
        SystemMessage(content=(
            "You are a programming language expert. Identify the programming language of the provided code. "
            "Respond with ONLY the language name (e.g., Python, JavaScript, Java, C++, Rust, Go, etc.). "
            "If uncertain, make your best guess."
        )),
        HumanMessage(content=(
            f"Hint: {state.get('language_hint', 'unknown')}\n\n"
            f"Code:\n{state['code']}\n\n"
            "What programming language is this?"
        )),
    ]
    response = llm.invoke(messages)
    return {"detected_language": response.content.strip()}


def analyze_structure_node(state: CodeExplainState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            f"You are an expert {state['detected_language']} developer. "
            "Analyze the structural components of the code: identify functions, classes, imports, loops, "
            "conditionals, data structures used, and design patterns if any. "
            "Present findings in a structured format."
        )),
        HumanMessage(content=(
            f"Code ({state['detected_language']}):\n{state['code']}\n\n"
            "Provide a structural analysis covering:\n"
            "- Key components (functions, classes, modules)\n"
            "- Data structures used\n"
            "- Control flow patterns\n"
            "- External dependencies/imports"
        )),
    ]
    response = llm.invoke(messages)
    return {"structure_analysis": response.content}


def generate_explanation_node(state: CodeExplainState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            f"You are a master {state['detected_language']} developer and educator. "
            "Provide a detailed, line-group-by-line-group explanation of this code. "
            "Explain WHAT each part does, WHY it's written that way, and HOW it connects to the whole. "
            "Make it accessible to intermediate developers."
        )),
        HumanMessage(content=(
            f"Language: {state['detected_language']}\n"
            f"Structure: {state['structure_analysis']}\n\n"
            f"Code:\n{state['code']}\n\n"
            "Generate a comprehensive, section-by-section explanation of this code."
        )),
    ]
    response = llm.invoke(messages)
    return {"detailed_explanation": response.content}


def summarize_node(state: CodeExplainState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            "You are a technical writer. Create a concise executive summary of a code explanation. "
            "Include: what the code does in 1-2 sentences, its purpose, key techniques used, "
            "and any notable strengths or potential improvements."
        )),
        HumanMessage(content=(
            f"Language: {state['detected_language']}\n"
            f"Explanation: {state['detailed_explanation']}\n\n"
            "Write a concise summary (3-5 sentences) of this code's purpose and key aspects."
        )),
    ]
    response = llm.invoke(messages)
    return {"summary": response.content}


# ─── Graph ──────────────────────────────────────────────────────────────────

def build_code_explain_graph() -> StateGraph:
    graph = StateGraph(CodeExplainState)

    graph.add_node("detect_language", detect_language_node)
    graph.add_node("analyze_structure", analyze_structure_node)
    graph.add_node("generate_explanation", generate_explanation_node)
    graph.add_node("summarize", summarize_node)

    graph.set_entry_point("detect_language")
    graph.add_edge("detect_language", "analyze_structure")
    graph.add_edge("analyze_structure", "generate_explanation")
    graph.add_edge("generate_explanation", "summarize")
    graph.add_edge("summarize", END)

    return graph.compile()


code_explain_graph = build_code_explain_graph()


async def run_code_explain_agent(code: str, language_hint: str = "") -> dict:
    """Run the code explanation agent and return the final state."""
    initial_state: CodeExplainState = {
        "code": code,
        "language_hint": language_hint or "unknown",
        "detected_language": "",
        "structure_analysis": "",
        "detailed_explanation": "",
        "summary": "",
    }
    result = await code_explain_graph.ainvoke(initial_state)
    return result
