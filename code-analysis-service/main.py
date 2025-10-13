from fastapi import FastAPI

app = FastAPI(title="Code Analysis Service", version="1.0.0")

@app.post("/api/analysis/analyze")
def analyze():
    return {"message": "Analyze endpoint - To be implemented"}

@app.get("/api/analysis/health")
def health():
    return {"status": "healthy", "service": "code-analysis-service"}
