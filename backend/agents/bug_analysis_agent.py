"""
Bug Analysis Assistant Agent
LangGraph workflow: classify_error → analyze_root_cause → suggest_fixes → generate_fixed_code
"""
from typing import TypedDict, Optional
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from utils.groq_client import get_groq_llm


# ─── State ──────────────────────────────────────────────────────────────────

class BugAnalysisState(TypedDict):
    code: str
    error_message: str
    language: str
    bug_classification: str
    root_causes: str
    suggested_fixes: str
    fixed_code: str


# ─── Nodes ──────────────────────────────────────────────────────────────────

def classify_error_node(state: BugAnalysisState) -> dict:
    llm = get_groq_llm(temperature=0.0)
    messages = [
        SystemMessage(content=(
            "You are an expert debugger. Classify the type of bug in the provided code. "
            "Categories: Syntax Error, Runtime Error, Logic Error, Type Error, "
            "Null/Undefined Error, Memory Error, Concurrency Bug, Off-By-One Error, "
            "API Misuse, Configuration Error, or Other. "
            "Identify the language if not provided. Explain the classification briefly."
        )),
        HumanMessage(content=(
            f"Code:\n{state['code']}\n\n"
            f"Error Message: {state.get('error_message', 'No error message provided')}\n"
            f"Language hint: {state.get('language', 'unknown')}\n\n"
            "Classify the bug type and identify the programming language."
        )),
    ]
    response = llm.invoke(messages)
    return {"bug_classification": response.content}


def analyze_root_cause_node(state: BugAnalysisState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            "You are a senior software engineer specializing in debugging. "
            "Perform a deep root cause analysis of the bug. "
            "List possible causes in order of likelihood. "
            "For each cause, explain WHY it causes the observed behavior."
        )),
        HumanMessage(content=(
            f"Code:\n{state['code']}\n\n"
            f"Error Message: {state.get('error_message', 'Not provided')}\n"
            f"Bug Classification: {state['bug_classification']}\n\n"
            "Identify and rank the most likely root causes of this bug. "
            "Format as numbered list with likelihood percentage and explanation for each."
        )),
    ]
    response = llm.invoke(messages)
    return {"root_causes": response.content}


def suggest_fixes_node(state: BugAnalysisState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            "You are an expert software engineer and code reviewer. "
            "Based on the bug analysis, provide specific, actionable fix suggestions. "
            "For each fix: explain what to change, why it works, and any trade-offs. "
            "Also mention best practices to prevent similar bugs in the future."
        )),
        HumanMessage(content=(
            f"Code:\n{state['code']}\n\n"
            f"Root Causes:\n{state['root_causes']}\n\n"
            "Provide detailed fix suggestions for each identified root cause, "
            "plus general prevention advice."
        )),
    ]
    response = llm.invoke(messages)
    return {"suggested_fixes": response.content}


def generate_fixed_code_node(state: BugAnalysisState) -> dict:
    llm = get_groq_llm(temperature=0.1)
    messages = [
        SystemMessage(content=(
            "You are an expert programmer. Apply the suggested fixes to produce corrected, "
            "clean, production-ready code. Add comments where you made changes. "
            "Return ONLY the fixed code block — no extra explanation."
        )),
        HumanMessage(content=(
            f"Original Code:\n{state['code']}\n\n"
            f"Suggested Fixes:\n{state['suggested_fixes']}\n\n"
            "Produce the complete fixed version of this code."
        )),
    ]
    response = llm.invoke(messages)
    return {"fixed_code": response.content}


# ─── Graph ──────────────────────────────────────────────────────────────────

def build_bug_analysis_graph() -> StateGraph:
    graph = StateGraph(BugAnalysisState)

    graph.add_node("classify_error", classify_error_node)
    graph.add_node("analyze_root_cause", analyze_root_cause_node)
    graph.add_node("suggest_fixes", suggest_fixes_node)
    graph.add_node("generate_fixed_code", generate_fixed_code_node)

    graph.set_entry_point("classify_error")
    graph.add_edge("classify_error", "analyze_root_cause")
    graph.add_edge("analyze_root_cause", "suggest_fixes")
    graph.add_edge("suggest_fixes", "generate_fixed_code")
    graph.add_edge("generate_fixed_code", END)

    return graph.compile()


bug_analysis_graph = build_bug_analysis_graph()


async def run_bug_analysis_agent(code: str, error_message: str = "", language: str = "") -> dict:
    """Run the bug analysis agent and return the final state."""
    initial_state: BugAnalysisState = {
        "code": code,
        "error_message": error_message or "No error message provided",
        "language": language or "unknown",
        "bug_classification": "",
        "root_causes": "",
        "suggested_fixes": "",
        "fixed_code": "",
    }
    result = await bug_analysis_graph.ainvoke(initial_state)
    return result
