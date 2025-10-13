from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from databases import Database
import sqlalchemy

DATABASE_URL = "mysql+aiomysql://user:password@localhost:3306/aiforgedb"

database = Database(DATABASE_URL)
metadata = sqlalchemy.MetaData()

app = FastAPI(title="Database Microservice")

# Simple users table for demo
users = sqlalchemy.Table(
    "users",
    metadata,
    sqlalchemy.Column("id", sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column("username", sqlalchemy.String(50), unique=True, index=True),
    sqlalchemy.Column("email", sqlalchemy.String(100), unique=True),
)

# Pydantic models
class UserIn(BaseModel):
    username: str
    email: Optional[str]

class UserOut(UserIn):
    id: int

@app.on_event("startup")
async def startup():
    await database.connect()
    engine = sqlalchemy.create_engine(DATABASE_URL.replace("+aiomysql", ""))
    metadata.create_all(engine)

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

@app.post("/users/", response_model=UserOut)
async def create_user(user: UserIn):
    query = users.insert().values(username=user.username, email=user.email)
    last_record_id = await database.execute(query)
    return {**user.dict(), "id": last_record_id}

@app.get("/users/{user_id}", response_model=UserOut)
async def read_user(user_id: int):
    query = users.select().where(users.c.id == user_id)
    user = await database.fetch_one(query)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user
