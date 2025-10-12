 # AiForge Platform - API Design Specification

## Service Architecture Overview

┌─────────────────┐ ┌──────────────────┐ ┌─────────────────────┐
│ Dashboard │───→│ Authentication │───→│ Project Service │
│ (Port 3000) │ │ (Port 8000) │ │ (Port 8001) │
└─────────────────┘ └──────────────────┘ └─────────────────────┘
│ │
└───────┬───────────────┼─────────────────────────────────────┐
│ │ │
┌───────▼────────┐ ┌────▼──────────┐ ┌──────────────────┐ │
│ Code Analysis │ │ Code Generator│ │ Security Scanner │ │
│ (Port 8002) │ │ (Port 8003) │ │ (Port 8004) │ │
└────────────────┘ └───────────────┘ └──────────────────┘ │
│ │
┌──────▼──────────┐ │
│ Notification      │◄────────────────────┘
│ (Port 8005) │
└─────────────────┘


## Authentication Flows

### JWT Authentication Flow
1. User submits credentials → Auth Service
2. Auth Service validates → Issues JWT + Refresh Token
3. Client includes JWT in Authorization header for all requests
4. Services validate JWT before processing requests
5. Refresh token when JWT expires

## 1. Authentication Service (Port 8000)

### Base URL: `/api/auth`

#### POST /signup
Register a new user account.

**Request:**
{
"email": "user@example.com",
"password": "securePassword123",
"name": "John Doe"
}


**Response (201 Created):**
{
"success": true,
"message": "User created successfully",
"user": {
"id": "user_123",
"email": "user@example.com",
"name": "John Doe",
"created_at": "2025-10-13T04:51:00Z"
}
}


**Error Response (400 Bad Request):**
{
"success": false,
"error": "Email already exists",
"code": "EMAIL_EXISTS"
}


#### POST /login
Authenticate user and return JWT tokens.

**Request:**
{
"email": "user@example.com",
"password": "securePassword123"
}


**Response (200 OK):**
{
"success": true,
"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"expires_in": 3600,
"user": {
"id": "user_123",
"email": "user@example.com",
"name": "John Doe"
}
}


#### POST /refresh
Refresh expired access token.

**Request:**
{
"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

**Response (200 OK):**
{"success": true,
"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
"expires_in": 3600
}


#### GET /health
Health check endpoint.

**Response (200 OK):**
{
"status": "healthy",
"service": "auth-service",
"timestamp": "2025-10-13T04:51:00Z",
"version": "1.0.0"
}


## 2. Project Service (Port 8001)

### Base URL: `/api/projects`
**Authentication Required:** Bearer JWT token in Authorization header

#### GET /projects
Get all projects for authenticated user.

**Headers:**
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

**Response (200 OK):**
{
"success": true,
"projects": [
{
"id": "proj_123",
"name": "E-commerce API",
"description": "REST API for online store",
"owner_id": "user_123",
"created_at": "2025-10-13T04:51:00Z",
"updated_at": "2025-10-13T04:51:00Z",
"status": "active"
}
],
"total": 1
}


#### POST /projects
Create a new project.

**Request:**
{
"name": "Mobile App Backend",
"description": "API services for mobile application"
}

**Response (201 Created):**
{
"success": true,
"project": {
"id": "proj_124",
"name": "Mobile App Backend",
"description": "API services for mobile application",
"owner_id": "user_123",
"created_at": "2025-10-13T04:51:00Z",
"status": "active"
}
}


#### GET /projects/{project_id}
Get specific project details.

**Response (200 OK):**
{
{
"success": true,
"project": {
"id": "proj_123",
"name": "E-commerce API",
"description": "REST API for online store",
"owner_id": "user_123",
"created_at": "2025-10-13T04:51:00Z",
"files_analyzed": 15,
"last_analysis": "2025-10-13T03:30:00Z"
}
}


#### PUT /projects/{project_id}
Update project information.

**Request:**
{
"name": "Updated Project Name",
"description": "Updated description"
}


#### DELETE /projects/{project_id}
Delete a project.

**Response (200 OK):**
{
"success": true,
"message": "Project deleted successfully"
}


## 3. Code Analysis Service (Port 8002)

### Base URL: `/api/analysis`

#### POST /analyze
Upload and analyze code file.

**Request:** `multipart/form-data`
- **file**: Code file (Python, JavaScript, Java, C++, etc.)
- **project_id**: Associated project ID (optional)

**Response (200 OK):**
