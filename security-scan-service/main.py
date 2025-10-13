from fastapi import FastAPI

app = FastAPI(title="Security Scan Service", version="1.0.0")

@app.post("/api/security/scan")
def scan():
    return {"message": "Scan endpoint - To be implemented"}

@app.get("/api/security/health")
def health():
    return {"status": "healthy", "service": "security-scan-service"}
