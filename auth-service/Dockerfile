# Use Python 3.12 slim image for smaller size and compatibility
FROM python:3.12-slim

# Set working directory inside the container
WORKDIR /app

# Install system dependencies needed for bcrypt
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy your FastAPI app code
COPY . .

# Expose the port your app will run on
EXPOSE 8000

# Command to run your FastAPI app with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
