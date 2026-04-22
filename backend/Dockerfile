# ─── Stage 1: Builder ───────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Environment variables (important for stability + speed)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DEFAULT_TIMEOUT=100

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip (with retry)
RUN pip install --upgrade pip --retries 10

# Copy only requirements first (for caching)
COPY requirements.txt .

# Install Python dependencies (RETRY + TIMEOUT + MORE STABLE)
RUN pip install \
    --no-cache-dir \
    --retries 10 \
    --timeout 100 \
    --prefer-binary \
    --prefix=/install \
    -r requirements.txt


# ─── Stage 2: Production ────────────────────────────────────────────────────
FROM python:3.11-slim AS production

WORKDIR /app

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source code
COPY . .

# Clean unnecessary files
RUN rm -rf venv __pycache__ .env

# Expose backend port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Run backend
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]