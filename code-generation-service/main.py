from fastapi import FastAPI

app = FastAPI(title="Code Generation Service", version="1.0.0")

@app.post("/api/generate/generate")
def generate():
    return {"message": "Generate endpoint - To be implemented"}

@app.get("/api/generate/health")
def health():
    return {"status": "healthy", "service": "code-generation-service"}
