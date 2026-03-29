"""
Software Requirements Analysis (SRS) Agent
LangGraph workflow: parse_document → extract_functional → extract_non_functional → format_output
"""
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from utils.groq_client import get_groq_llm


# ─── State ──────────────────────────────────────────────────────────────────

class SRSState(TypedDict):
    document_text: str
    project_name: str
    document_summary: str
    functional_requirements: str
    non_functional_requirements: str
    formatted_output: str


# ─── Nodes ──────────────────────────────────────────────────────────────────

def parse_document_node(state: SRSState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            "You are a senior business analyst and software architect. "
            "Parse the provided requirements document. "
            "Identify: the system/project name, main goal, stakeholders, scope, "
            "and high-level system description. Provide a structured summary."
        )),
        HumanMessage(content=(
            f"Project Name Hint: {state.get('project_name', 'Not specified')}\n\n"
            f"Requirements Document:\n{state['document_text']}\n\n"
            "Parse and summarize this document. Identify the project name if not given."
        )),
    ]
    response = llm.invoke(messages)
    return {"document_summary": response.content}


def extract_functional_node(state: SRSState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            "You are an expert software requirements engineer. "
            "Extract ALL functional requirements from the document. "
            "Functional requirements describe WHAT the system must DO — features, behaviors, functions. "
            "Format each as: FR-001: [Title] | Description | Priority (High/Medium/Low) | User Role. "
            "Be exhaustive — do not miss any implied requirements."
        )),
        HumanMessage(content=(
            f"Document Summary: {state['document_summary']}\n\n"
            f"Full Document:\n{state['document_text']}\n\n"
            "Extract all functional requirements in the specified format. "
            "Number them FR-001, FR-002, etc."
        )),
    ]
    response = llm.invoke(messages)
    return {"functional_requirements": response.content}


def extract_non_functional_node(state: SRSState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            "You are an expert software requirements engineer specializing in quality attributes. "
            "Extract ALL non-functional requirements from the document. "
            "Non-functional requirements describe HOW WELL the system performs — "
            "performance, security, scalability, usability, reliability, maintainability, etc. "
            "Format each as: NFR-001: [Category] | [Title] | Description | Measurable Criteria. "
            "Include implied non-functional requirements even if not explicitly stated."
        )),
        HumanMessage(content=(
            f"Document Summary: {state['document_summary']}\n\n"
            f"Full Document:\n{state['document_text']}\n\n"
            "Extract all non-functional requirements in the specified format. "
            "Number them NFR-001, NFR-002, etc."
        )),
    ]
    response = llm.invoke(messages)
    return {"non_functional_requirements": response.content}


def format_output_node(state: SRSState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            "You are a technical documentation specialist. "
            "Create a final, professional, formatted SRS summary document. "
            "Include sections: Project Overview, Stakeholders, Functional Requirements Table, "
            "Non-Functional Requirements Table, and a Requirements Statistics summary. "
            "Use clean markdown formatting."
        )),
        HumanMessage(content=(
            f"Project: {state.get('project_name', 'Unknown Project')}\n"
            f"Summary: {state['document_summary']}\n\n"
            f"Functional Requirements:\n{state['functional_requirements']}\n\n"
            f"Non-Functional Requirements:\n{state['non_functional_requirements']}\n\n"
            "Create a complete, professional SRS document in markdown format."
        )),
    ]
    response = llm.invoke(messages)
    return {"formatted_output": response.content}


# ─── Graph ──────────────────────────────────────────────────────────────────

def build_srs_graph() -> StateGraph:
    graph = StateGraph(SRSState)

    graph.add_node("parse_document", parse_document_node)
    graph.add_node("extract_functional", extract_functional_node)
    graph.add_node("extract_non_functional", extract_non_functional_node)
    graph.add_node("format_output", format_output_node)

    graph.set_entry_point("parse_document")
    graph.add_edge("parse_document", "extract_functional")
    graph.add_edge("extract_functional", "extract_non_functional")
    graph.add_edge("extract_non_functional", "format_output")
    graph.add_edge("format_output", END)

    return graph.compile()


srs_graph = build_srs_graph()


async def run_srs_agent(document_text: str, project_name: str = "") -> dict:
    """Run the SRS extraction agent and return the final state."""
    initial_state: SRSState = {
        "document_text": document_text,
        "project_name": project_name or "Not specified",
        "document_summary": "",
        "functional_requirements": "",
        "non_functional_requirements": "",
        "formatted_output": "",
    }
    result = await srs_graph.ainvoke(initial_state)
    return result
