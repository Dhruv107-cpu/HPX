from typing import List

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends
)

from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.auth.dependencies import get_current_user
from app.users.models import User

from app.analytics.service import save_uploaded_files

from app.analytics.service import (
    save_uploaded_files
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)

@router.post("/upload")
async def upload_files(
  files: list[UploadFile] = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return save_uploaded_files(
        files,
        current_user,
        db
    )

@router.get("/summary")
def analytics_summary():
    return {
        "message": "Analytics Module Ready"
    }