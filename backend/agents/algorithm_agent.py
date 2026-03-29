"""
Algorithm Generation & Explanation Agent
LangGraph workflow: analyze_problem → generate_algorithm → explain_algorithm → analyze_complexity
"""
from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage, SystemMessage
from utils.groq_client import get_groq_llm


# ─── State ──────────────────────────────────────────────────────────────────

class AlgorithmState(TypedDict):
    problem: str
    language: str
    constraints: str
    analysis: str
    algorithm_code: str
    explanation: str
    complexity: str


# ─── Nodes ──────────────────────────────────────────────────────────────────

def analyze_problem_node(state: AlgorithmState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            "You are an expert algorithm designer. Analyze the given programming problem. "
            "Break it down into: Problem Type, Key Requirements, Edge Cases, and Suggested Approach. "
            "Be concise but thorough."
        )),
        HumanMessage(content=(
            f"Problem: {state['problem']}\n"
            f"Constraints: {state.get('constraints', 'None specified')}\n"
            f"Target Language: {state['language']}\n\n"
            "Provide a structured problem analysis."
        )),
    ]
    response = llm.invoke(messages)
    return {"analysis": response.content}


def generate_algorithm_node(state: AlgorithmState) -> dict:
    llm = get_groq_llm(temperature=0.1)
    messages = [
        SystemMessage(content=(
            f"You are an expert {state['language']} programmer. "
            "Generate a complete, clean, well-commented algorithmic solution. "
            "Include all necessary imports. The code must be correct and production-ready."
        )),
        HumanMessage(content=(
            f"Problem: {state['problem']}\n"
            f"Analysis: {state['analysis']}\n"
            f"Constraints: {state.get('constraints', 'None')}\n\n"
            f"Write the complete {state['language']} algorithm. Return ONLY the code block."
        )),
    ]
    response = llm.invoke(messages)
    return {"algorithm_code": response.content}


def explain_algorithm_node(state: AlgorithmState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            "You are a computer science educator. Explain the algorithm step-by-step so that "
            "both beginners and intermediate developers can understand it. "
            "Use numbered steps and explain the logic behind each key decision."
        )),
        HumanMessage(content=(
            f"Problem: {state['problem']}\n"
            f"Algorithm:\n{state['algorithm_code']}\n\n"
            "Provide a detailed step-by-step explanation of this algorithm."
        )),
    ]
    response = llm.invoke(messages)
    return {"explanation": response.content}


def analyze_complexity_node(state: AlgorithmState) -> dict:
    llm = get_groq_llm()
    messages = [
        SystemMessage(content=(
            "You are a computer science expert specializing in algorithm analysis. "
            "Analyze the time and space complexity of the provided algorithm. "
            "Explain the Big-O notation choices clearly with justification."
        )),
        HumanMessage(content=(
            f"Algorithm:\n{state['algorithm_code']}\n\n"
            "Analyze:\n"
            "1. Time Complexity (best, average, worst case)\n"
            "2. Space Complexity\n"
            "3. Is this optimal? Are there better approaches?\n"
            "4. Practical performance notes."
        )),
    ]
    response = llm.invoke(messages)
    return {"complexity": response.content}


# ─── Graph ──────────────────────────────────────────────────────────────────

def build_algorithm_graph() -> StateGraph:
    graph = StateGraph(AlgorithmState)

    graph.add_node("analyze_problem", analyze_problem_node)
    graph.add_node("generate_algorithm", generate_algorithm_node)
    graph.add_node("explain_algorithm", explain_algorithm_node)
    graph.add_node("analyze_complexity", analyze_complexity_node)

    graph.set_entry_point("analyze_problem")
    graph.add_edge("analyze_problem", "generate_algorithm")
    graph.add_edge("generate_algorithm", "explain_algorithm")
    graph.add_edge("explain_algorithm", "analyze_complexity")
    graph.add_edge("analyze_complexity", END)

    return graph.compile()


algorithm_graph = build_algorithm_graph()


async def run_algorithm_agent(problem: str, language: str = "Python", constraints: str = "") -> dict:
    """Run the algorithm agent and return the final state."""
    initial_state: AlgorithmState = {
        "problem": problem,
        "language": language,
        "constraints": constraints or "None specified",
        "analysis": "",
        "algorithm_code": "",
        "explanation": "",
        "complexity": "",
    }
    result = await algorithm_graph.ainvoke(initial_state)
    return result
