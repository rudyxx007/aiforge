from fastapi import FastAPI

app = FastAPI(title="Notification Service", version="1.0.0")

@app.post("/api/notifications/notify")
def notify():
    return {"message": "Notify endpoint - To be implemented"}

@app.get("/api/notifications/health")
def health():
    return {"status": "healthy", "service": "notification-service"}
