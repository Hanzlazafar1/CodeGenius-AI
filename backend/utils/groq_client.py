import os
from functools import lru_cache
from langchain_groq import ChatGroq
from dotenv import load_dotenv

load_dotenv(override=True)


@lru_cache(maxsize=None)
def get_groq_llm(model: str | None = None, temperature: float = 0.3) -> ChatGroq:
    """Return a cached ChatGroq instance."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY not set in environment. Copy .env.example to .env and add your key.")
    
    selected_model = model or os.getenv("GROQ_MODEL", "llama3-70b-8192")
    
    return ChatGroq(
        api_key=api_key,
        model=selected_model,
        temperature=temperature,
        streaming=True,
    )
