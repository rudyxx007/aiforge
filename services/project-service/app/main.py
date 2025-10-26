from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, auth
from .database import engine, Base, get_db

# This creates the "projects" table in the database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Project Service")

@app.post("/projects", response_model=schemas.Project)
def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(get_db), 
    token_data: auth.TokenData = Depends(auth.get_current_user)
):
    # The owner_id comes from the validated token
    db_project = models.Project(**project.dict(), owner_id=token_data.user_id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/projects", response_model=list[schemas.Project])
def get_user_projects(
    db: Session = Depends(get_db), 
    token_data: auth.TokenData = Depends(auth.get_current_user)
):
    # Only return projects owned by the user in the token
    projects = db.query(models.Project).filter(models.Project.owner_id == token_data.user_id).all()
    return projects