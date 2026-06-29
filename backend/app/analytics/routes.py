from typing import List

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends
)
from app.analytics.schemas import (
    UploadedFileResponse
)
from fastapi import HTTPException
from fastapi.responses import FileResponse
import os


from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.auth.dependencies import get_current_user
from app.users.models import User

from app.analytics.service import (
    save_uploaded_files,
    get_uploaded_files,
    download_uploaded_file
)
from app.analytics.analytics_service import (
    get_region_capacity_summary,
    get_state_capacity_summary
)

from app.analytics.schemas import (
    RegionCapacitySummary,
    StateCapacitySummary
)

router = APIRouter(
    prefix="/analytics",
    tags=["Analytics"]
)
@router.get(
    "/files/{file_id}/download"
)
def download_file(
    file_id: str,
    db: Session = Depends(get_db)
):

    return download_uploaded_file(
        file_id,
        db
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
@router.get(
    "/files",
    response_model=List[
        UploadedFileResponse
    ]
)
def list_uploaded_files(
    db: Session = Depends(
        get_db
    )
):

    return get_uploaded_files(
        db
    )

@router.get(
    "/installed-capacity/regions",
    response_model=list[
        RegionCapacitySummary
    ]
)
def region_capacity_summary(
    db: Session = Depends(
        get_db
    )
):

    return get_region_capacity_summary(
        db
    )

@router.get(
    "/installed-capacity/states",
    response_model=list[
        StateCapacitySummary
    ]
)
def state_capacity_summary(
    region: str,
    db: Session = Depends(
        get_db
    )
):

    return get_state_capacity_summary(
        region,
        db
    )
