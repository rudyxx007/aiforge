from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager

from . import models, schemas, auth
from .database import engine, get_db, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup... creating database tables.")
    Base.metadata.create_all(bind=engine)
    yield
    print("Application shutdown...")

app = FastAPI(title="Project Service", lifespan=lifespan)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "project-service"}

@app.post("/projects", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    token_data: auth.TokenData = Depends(auth.get_current_user),
):
    db_project = models.Project(**project.dict(), owner_id=token_data.user_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects", response_model=list[schemas.Project])
def get_user_projects(
    db: Session = Depends(get_db),
    token_data: auth.TokenData = Depends(auth.get_current_user),
):
    projects = db.query(models.Project).filter(models.Project.owner_id == token_data.user_id).all()
    return projects

