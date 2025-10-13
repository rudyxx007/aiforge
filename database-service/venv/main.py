from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import Column, Integer, String, MetaData, Table, select

DATABASE_URL = "mysql+aiomysql://user:password@localhost:3306/aiforgedb"

# Set up SQLAlchemy async engine
engine = create_async_engine(DATABASE_URL, echo=True)
metadata = MetaData()

# Define users table with SQLAlchemy Table API
users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("username", String(50), unique=True, index=True),
    Column("email", String(100), unique=True),
)

# Set up session maker for async sessions
async_session = async_sessionmaker(engine, expire_on_commit=False)

app = FastAPI(title="Database Microservice")

class UserIn(BaseModel):
    username: str
    email: Optional[str]

class UserOut(UserIn):
    id: int

@app.on_event("startup")
async def startup():
    # Create tables in database if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(metadata.create_all)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session

@app.post("/users/", response_model=UserOut)
async def create_user(user: UserIn, session: AsyncSession = Depends(get_session)):
    stmt = users.insert().values(username=user.username, email=user.email)
    result = await session.execute(stmt)
    await session.commit()
    user_id = result.lastrowid
    return {**user.dict(), "id": user_id}

@app.get("/users/{user_id}", response_model=UserOut)
async def read_user(user_id: int, session: AsyncSession = Depends(get_session)):
    stmt = select(users).where(users.c.id == user_id)
    result = await session.execute(stmt)
    user = result.fetchone()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user._mapping
