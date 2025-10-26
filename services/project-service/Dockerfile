FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
EXPOSE 8000

# --- DB Connection Robustness ---
# Install netcat (for wait.sh) AND curl (for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends netcat-openbsd curl \
    && rm -rf /var/lib/apt/lists/*

COPY wait.sh /usr/local/bin/wait.sh
RUN chmod +x /usr/local/bin/wait.sh
# --- End DB Connection Robustness ---

ENV PYTHONPATH=/app

# Final CMD: Executes the wait script, which then runs Uvicorn.
CMD ["/usr/local/bin/wait.sh"]