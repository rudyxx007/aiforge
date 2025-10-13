# Service Endpoints & Ports

## Authentication Service (Port 8000)
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/refresh
- GET  /api/auth/health

## Project Service (Port 8001)
- GET    /api/projects
- POST   /api/projects
- GET    /api/projects/{projectId}
- PUT    /api/projects/{projectId}
- DELETE /api/projects/{projectId}
- GET    /api/projects/health

## Code Analysis Service (Port 8002)
- POST /api/analysis/analyze
- GET  /api/analysis/health

## Code Generation Service (Port 8003)
- POST /api/generate/generate
- GET  /api/generate/health

## Security Scan Service (Port 8004)
- POST /api/security/scan
- GET  /api/security/health

## Notification Service (Port 8005)
- POST /api/notifications/notify
- GET  /api/notifications/health

## Dashboard Service (Port 3000)
- GET /               (serves React app)
- Proxy all `/api/*` calls to appropriate service
