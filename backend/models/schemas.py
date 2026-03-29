from pydantic import BaseModel, Field
from typing import Optional


# ─── Algorithm Agent ────────────────────────────────────────────────────────

class AlgorithmRequest(BaseModel):
    problem: str = Field(..., description="Problem description to solve")
    language: str = Field(default="Python", description="Programming language")
    constraints: Optional[str] = Field(None, description="Optional constraints")

class AlgorithmResponse(BaseModel):
    algorithm_code: str
    explanation: str
    complexity: str
    language: str


# ─── Code Explanation Agent ─────────────────────────────────────────────────

class CodeExplainRequest(BaseModel):
    code: str = Field(..., description="Source code to explain")
    language: Optional[str] = Field(None, description="Programming language hint")

class CodeExplainResponse(BaseModel):
    detected_language: str
    structure_analysis: str
    detailed_explanation: str
    summary: str


# ─── Bug Analysis Agent ─────────────────────────────────────────────────────

class BugAnalysisRequest(BaseModel):
    code: str = Field(..., description="Code containing the bug")
    error_message: Optional[str] = Field(None, description="Error message if available")
    language: Optional[str] = Field(None, description="Programming language")

class BugAnalysisResponse(BaseModel):
    bug_type: str
    root_causes: list[str]
    suggested_fixes: str
    fixed_code: Optional[str]


# ─── SRS Agent ──────────────────────────────────────────────────────────────

class SRSRequest(BaseModel):
    document_text: str = Field(..., description="Requirements document or description")
    project_name: Optional[str] = Field(None, description="Optional project name")

class SRSResponse(BaseModel):
    project_name: str
    functional_requirements: list[dict]
    non_functional_requirements: list[dict]
    summary: str


# ─── Generic streaming chunk ────────────────────────────────────────────────

class StreamChunk(BaseModel):
    content: str
    done: bool = False
    error: Optional[str] = None
