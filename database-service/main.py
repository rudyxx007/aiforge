from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import Column, Integer, String, MetaData, Table, select

DATABASE_URL = "mysql+aiomysql://user:password@localhost:3306/aiforgedb"

engine = create_async_engine(DATABASE_URL, echo=True)
metadata = MetaData()

users = Table(
    "users", metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("username", String(50), unique=True, index=True),
    Column("email", String(100), unique=True),
)

async_session = async_sessionmaker(engine, expire_on_commit=False)

app = FastAPI(title="Database Microservice")

class UserIn(BaseModel):
    username: str
    email: Optional[str]

class UserOut(UserIn):
    id: int

@app.on_event("startup")
async def startup():
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

@app.get("/users/", response_model=List[UserOut])
async def read_users(session: AsyncSession = Depends(get_session)):
    stmt = select(users)
    result = await session.execute(stmt)
    users_list = result.fetchall()
    return [user._mapping for user in users_list]

@app.put("/users/{user_id}", response_model=UserOut)
async def update_user(user_id: int, user: UserIn, session: AsyncSession = Depends(get_session)):
    stmt = users.update().where(users.c.id == user_id).values(username=user.username, email=user.email)
    result = await session.execute(stmt)
    await session.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {**user.dict(), "id": user_id}

@app.delete("/users/{user_id}")
async def delete_user(user_id: int, session: AsyncSession = Depends(get_session)):
    stmt = users.delete().where(users.c.id == user_id)
    result = await session.execute(stmt)
    await session.commit()
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}
