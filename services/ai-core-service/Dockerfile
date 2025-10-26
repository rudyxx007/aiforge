FROM python:3.11-slim

# Set the working directory first
WORKDIR /app

# Copy requirements FIRST and install dependencies
# This leverages Docker caching better
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the application code into the working directory
COPY app/ ./app/

# Expose the port
EXPOSE 8000

# Explicitly add the current working directory to PYTHONPATH
# Redundant with WORKDIR but ensures it's set
ENV PYTHONPATH "${PYTHONPATH}:/app"

# === Add DB Wait logic ONLY for auth-service and project-service ===
# --- DB Connection Robustness ---
# Only include these lines in auth-service/Dockerfile & project-service/Dockerfile
# RUN apt-get update && apt-get install -y --no-install-recommends netcat-openbsd && rm -rf /var/lib/apt/lists/*
# COPY wait.sh /usr/local/bin/wait.sh
# RUN chmod +x /usr/local/bin/wait.sh
# --- End DB Wait Logic ---

# Final CMD: Use python -m for robustness
# For auth-service & project-service, this will be run by wait.sh
# For ai-core-service & analysis-service, this is the main command
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]