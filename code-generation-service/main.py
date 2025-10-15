from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Code Generation Service")

class GenerateRequest(BaseModel):
    prompt: str

@app.post("/api/generate")
def generate_code(req: GenerateRequest):
    # Dummy code generation
    generated_code = f"# Generated code based on prompt: {req.prompt}"
    return {"code": generated_code}

@app.get("/api/generate/health")
def health():
    return {"status": "healthy", "service": "code-generation-service"}
