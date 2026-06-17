from fastapi import FastAPI

from app.database.base import Base
from app.database.database import engine, SessionLocal

from app.users.models import User
from app.auth.service import create_superadmin
from app.auth.routes import router as auth_router
from app.users.routes import router as user_router
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HPX Trade Analytics Dashboard"
)
app.include_router(auth_router)
app.include_router(user_router)


@app.on_event("startup")
def startup_event():

    print("Application Startup")

    db = SessionLocal()

    try:
        create_superadmin(db)

    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "Backend Running Successfully"
    }