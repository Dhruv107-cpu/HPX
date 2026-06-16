from fastapi import FastAPI

from app.database.base import Base
from app.database.database import engine

from app.users.models import User


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HPX Trade Analytics Dashboard"
)


@app.get("/")
def root():
    return {
        "message": "Backend Running Successfully"
    }