from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Project Service", version="1.0.0")

# In-memory project storage
projects = {}

class Project(BaseModel):
    id: int
    name: str
    description: str | None = None

@app.get("/api/projects/health")
def health():
    return {"status": "healthy", "service": "project-service"}

@app.get("/api/projects", response_model=List[Project])
def list_projects():
    return list(projects.values())

@app.post("/api/projects", response_model=Project)
def create_project(project: Project):
    if project.id in projects:
        raise HTTPException(status_code=400, detail="Project ID already exists")
    projects[project.id] = project
    return project

@app.get("/api/projects/{project_id}", response_model=Project)
def get_project(project_id: int):
    project = projects.get(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@app.put("/api/projects/{project_id}", response_model=Project)
def update_project(project_id: int, updated_project: Project):
    if project_id != updated_project.id:
        raise HTTPException(status_code=400, detail="Project ID mismatch")
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    projects[project_id] = updated_project
    return updated_project

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int):
    if project_id not in projects:
        raise HTTPException(status_code=404, detail="Project not found")
    del projects[project_id]
    return {"detail": "Project deleted"}
