from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import time

# Get the database host from an environment variable
# In docker-compose, this will be "postgres-db"
# In Kubernetes, this will be "postgres-gke-service"
DB_HOST = os.environ.get("DB_HOST", "localhost")

# Get credentials from environment variables
DB_USER = os.environ.get("POSTGRES_USER")
DB_PASSWORD = os.environ.get("POSTGRES_PASSWORD")
DB_NAME = os.environ.get("POSTGRES_DB")

if not all([DB_HOST, DB_USER, DB_PASSWORD, DB_NAME]):
    print("FATAL ERROR: Database environment variables are not fully set.")
    time.sleep(60) # Sleep to allow log reading before container crash
    os._exit(1) # Exit immediately if config is missing

# Build the final URL
SQLALCHEMY_DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:5432/{DB_NAME}"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()