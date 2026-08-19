from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from pathlib import Path

# Load the backend .env file explicitly only when the runtime environment
# has not already provided a DATABASE_URL. This prevents Docker from silently
# reusing a stale localhost connection string from a local development setup.

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    load_dotenv(ENV_PATH)
    DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        f"DATABASE_URL is not configured. "
        f"Expected .env file at: {ENV_PATH}"
    )

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=1800,
    connect_args={"connect_timeout": 10},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()