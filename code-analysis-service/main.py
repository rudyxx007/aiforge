from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Code Analysis Service", version="1.0.0")

class AnalyzeRequest(BaseModel):
    code: str

@app.post("/api/analyze")
def analyze(req: AnalyzeRequest):
    complexity = "low" if len(req.code) < 100 else "high"
    return {"complexity": complexity, "lines": req.code.count('\n') + 1}

@app.get("/api/analyze/health")
def health():
    return {"status": "healthy", "service": "code-analysis-service"}
