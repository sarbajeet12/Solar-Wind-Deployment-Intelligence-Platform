from fastapi import FastAPI
from app.api.auth import router as auth_router

from app.database.database import Base, engine
from app.models.user import User


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Solar & Wind Deployment Intelligence Platform"
)

app.include_router(auth_router)


@app.get("/")
def home():
    return {
        "message": "Backend is running successfully!"
    }