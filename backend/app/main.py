from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.database.base import Base
from app.database.database import engine, SessionLocal

from app.users.models import User
from app.auth.service import create_superadmin
from app.auth.routes import router as auth_router
from app.users.routes import router as user_router
from fastapi.middleware.cors import CORSMiddleware
from app.analytics.routes import (
    router as analytics_router
)
from app.scheduler.router import router as scheduler_router

# Syncs database schema models
Base.metadata.create_all(bind=engine)


# FIX: Added 'def' keyword properly here
@asynccontextmanager
async def melon_lifespan(app: FastAPI):
    print("Application Startup")
    db = SessionLocal()
    try:
        create_superadmin(db)
    finally:
        db.close()
    yield
    print("Application Shutdown")


app = FastAPI(
    title="HPX Trade Analytics Dashboard",
    lifespan=melon_lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(
    analytics_router
)
app.include_router(scheduler_router)

@app.get("/")
def root():
    return {
        "message": "Backend Running Successfully"
    }