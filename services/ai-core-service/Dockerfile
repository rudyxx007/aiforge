FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# --- Healthcheck Dependency ---
# Install curl for docker-compose healthchecks
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
# --- End Healthcheck Dependency ---

COPY app/ ./app/
EXPOSE 8000

ENV PYTHONPATH=/app

# Final CMD: Uses 'python -m uvicorn' for robust module loading
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]