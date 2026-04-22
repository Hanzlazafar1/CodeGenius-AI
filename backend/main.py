"""
CodeGenius AI — FastAPI Backend
Serves 4 AI agent endpoints with streaming SSE responses.
"""
import json
import asyncio
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv

from models.schemas import (
    AlgorithmRequest,
    CodeExplainRequest,
    BugAnalysisRequest,
    SRSRequest,
)
from agents.algorithm_agent import run_algorithm_agent
from agents.code_explain_agent import run_code_explain_agent
from agents.bug_analysis_agent import run_bug_analysis_agent
from agents.srs_agent import run_srs_agent

load_dotenv(override=True)


# ─── App Lifecycle ──────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("STARTING: CodeGenius AI Backend...")
    yield
    print("STOPPING: CodeGenius AI Backend...")


app = FastAPI(
    title="CodeGenius AI",
    description="Multi-agent Software Engineering AI platform powered by LangGraph + Groq",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS ───────────────────────────────────────────────────────────────────

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Helpers ────────────────────────────────────────────────────────────────

def sse_event(data: dict) -> str:
    """Format data as Server-Sent Event string."""
    return f"data: {json.dumps(data)}\n\n"


async def stream_agent_result(coro) -> StreamingResponse:
    """Run an agent coroutine and stream the result as SSE."""
    async def generator():
        try:
            yield sse_event({"status": "running", "message": "Agent is thinking..."})
            await asyncio.sleep(0.05)  # flush
            result = await coro
            yield sse_event({"status": "complete", "result": result})
        except Exception as e:
            yield sse_event({"status": "error", "message": str(e)})

    return StreamingResponse(
        generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


# ─── Health Check ───────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {
        "app": "CodeGenius AI",
        "version": "1.0.0",
        "status": "running",
        "agents": ["algorithm", "code-explain", "bug-analysis", "srs"],
    }


@app.get("/health", tags=["Health"])
async def health():
    groq_key_set = bool(os.getenv("GROQ_API_KEY"))
    return {
        "status": "healthy",
        "groq_api_key_configured": groq_key_set,
    }


# ─── Agent 1: Algorithm Generation ──────────────────────────────────────────

@app.post("/api/algorithm", tags=["Agents"])
async def algorithm_agent(request: AlgorithmRequest):
    """
    Algorithm Generation & Explanation Agent.
    Analyzes the problem, generates code, explains it, and performs complexity analysis.
    """
    coro = run_algorithm_agent(
        problem=request.problem,
        language=request.language,
        constraints=request.constraints or "",
    )
    return await stream_agent_result(coro)


# ─── Agent 2: Code Explanation ───────────────────────────────────────────────

@app.post("/api/code-explain", tags=["Agents"])
async def code_explain_agent(request: CodeExplainRequest):
    """
    Code Explanation Assistant.
    Detects language, analyzes structure, generates detailed explanation and summary.
    """
    coro = run_code_explain_agent(
        code=request.code,
        language_hint=request.language or "",
    )
    return await stream_agent_result(coro)


# ─── Agent 3: Bug Analysis ────────────────────────────────────────────────────

@app.post("/api/bug-analysis", tags=["Agents"])
async def bug_analysis_agent(request: BugAnalysisRequest):
    """
    Bug Analysis Assistant.
    Classifies the error, traces root causes, suggests fixes, and provides fixed code.
    """
    coro = run_bug_analysis_agent(
        code=request.code,
        error_message=request.error_message or "",
        language=request.language or "",
    )
    return await stream_agent_result(coro)


# ─── Agent 4: SRS Extraction ─────────────────────────────────────────────────

@app.post("/api/srs", tags=["Agents"])
async def srs_agent(request: SRSRequest):
    """
    Software Requirements Analysis Agent.
    Parses documents and extracts structured functional and non-functional requirements.
    """
    coro = run_srs_agent(
        document_text=request.document_text,
        project_name=request.project_name or "",
    )
    return await stream_agent_result(coro)


# ─── Run ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
