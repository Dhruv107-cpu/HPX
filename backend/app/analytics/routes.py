from typing import List

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Depends,
    Query
)
from datetime import datetime
from app.analytics.schemas import (
    UploadedFileResponse
)
from fastapi import HTTPException
from fastapi.responses import FileResponse
import os
from enum import Enum

from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.auth.dependencies import get_current_user
from app.users.models import User
class TrendInterval(str, Enum):
    fifteen_minutes = "15m"
    hourly = "hourly"
    daily = "daily"
    monthly = "monthly"


from app.analytics.service import (
    save_uploaded_files,
    get_uploaded_files,
    download_uploaded_file,
    fetch_live_generation_summary,
    parse_live_generation_summary,
    save_live_generation_summary,
      fetch_power_station_data,
    parse_power_station_data,
    save_power_station_data,
     get_state_preview,
     get_generation_trend,
     get_power_station_portfolio,
     fetch_all_power_station_data,

)
from app.analytics.analytics_service import (
    get_region_capacity_summary,
    get_state_capacity_summary,
    get_monthly_region_capacity_summary,
    get_monthly_state_capacity_summary,
     get_dgr_summary,
    get_dgr_region_summary,
    get_latest_live_generation_summary,
    get_live_generation_trend,
    get_latest_power_station_data,
    
)


from app.analytics.schemas import (
    RegionCapacitySummary,
    StateCapacitySummary,
    MonthlyRegionCapacitySummary,
    MonthlyStateCapacitySummary,
    DGRSummary,
    DGRRegionSummary,
    LiveGenerationSummaryResponse,
    LiveGenerationTrend,
    PowerStationFetchResponse,
    PowerStationAnalytics,
    StatePreviewResponse,
     GenerationTrendResponse,
     PowerStationPortfolioResponse,
     PowerStationFetchAllResponse,
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

@router.get(
    "/installed-capacity/monthly/regions",
    response_model=list[
        MonthlyRegionCapacitySummary
    ]
)
def monthly_region_capacity_summary(
    db: Session = Depends(
        get_db
    )
):

    return get_monthly_region_capacity_summary(
        db
    )

@router.get(
    "/installed-capacity/monthly/states",
    response_model=list[
        MonthlyStateCapacitySummary
    ]
)
def monthly_state_capacity_summary(
    region: str | None = None,
    db: Session = Depends(
        get_db
    )
):

    return get_monthly_state_capacity_summary(
        region,
        db
    )

@router.get(
    "/dgr/summary",
    response_model=DGRSummary
)
def dgr_summary(
    db: Session = Depends(get_db)
):

    return get_dgr_summary(
        db
    )


@router.get(
    "/dgr/regions",
    response_model=list[DGRRegionSummary]
)
def dgr_region_summary(
    db: Session = Depends(get_db)
):

    return get_dgr_region_summary(
        db
    )

@router.post("/merit/fetch")
def fetch_merit_data(
    db: Session = Depends(get_db)
):
    html = fetch_live_generation_summary()

    data = parse_live_generation_summary(html)

    record = save_live_generation_summary(db, data)

    return {
        "status": "success",
        "snapshot_id": record.id
    }
@router.get(
    "/live-generation/summary",
    response_model=LiveGenerationSummaryResponse,
)
def get_live_generation_summary(
    db: Session = Depends(get_db),
):
    data =get_latest_live_generation_summary(db)

    if not data:
        raise HTTPException(
            status_code=404,
            detail="No live generation data available."
        )

    return data

@router.get("/live-generation/trend", response_model=list[LiveGenerationTrend])
def get_live_generation_trend_api(
    interval: TrendInterval= Query(..., description="15m, hourly, daily, monthly"),
    db: Session = Depends(get_db),
):
    try:
        return get_live_generation_trend(db, interval)
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

@router.post(
    "/power-stations/fetch",
    response_model=PowerStationFetchResponse,
)
def fetch_power_station_data_api(
    state_code: str,
    report_date: str,
    db: Session = Depends(get_db),
):
    raw_data = fetch_power_station_data(
        state_code=state_code,
        report_date=report_date,
    )

    parsed_data = parse_power_station_data(
        raw_data=raw_data,
        state_code=state_code,
        report_date=report_date,
    )

    try:
        records_saved = save_power_station_data(
        db=db,
        parsed_data=parsed_data,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
    )

    return PowerStationFetchResponse(
        status="success",
        records_saved=records_saved,
    )
@router.post(
    "/power-stations/fetch-all",
    response_model=PowerStationFetchAllResponse,
)
def fetch_all_power_station_data_api(
    report_date: str | None = None,
    db: Session = Depends(get_db),
):
    if report_date is None:
        report_date = datetime.now().strftime("%d %b %Y")

    return fetch_all_power_station_data(
        db=db,
        report_date=report_date,
    )

@router.get(
    "/power-stations",
    response_model=list[PowerStationAnalytics],
)
def get_power_station_data(
    state_code: str | None = None,
    generation_type: str | None = None,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    return get_latest_power_station_data(
        db=db,
        state_code=state_code,
        generation_type=generation_type,
        limit=limit,
    )
@router.get(
    "/power-stations/portfolio/{state_code}",
    response_model=PowerStationPortfolioResponse,
)
def get_power_station_portfolio_api(
    state_code: str,
    db: Session = Depends(get_db),
):
    portfolio = get_power_station_portfolio(
        db=db,
        state_code=state_code,
    )

    if portfolio is None:
        raise HTTPException(
            status_code=404,
            detail="Portfolio data not found",
        )

    return portfolio
@router.get(
    "/state-preview",
    response_model=StatePreviewResponse,
)
def get_state_preview_api(
    state_code: str,
    db: Session = Depends(get_db),
):
    preview = get_state_preview(
        db=db,
        state_code=state_code,
    )

    if preview is None:
        raise HTTPException(
            status_code=404,
            detail="State data not found",
        )

    return preview
@router.get(
    "/generation-trend",
    response_model=list[GenerationTrendResponse],
)
def generation_trend(
    interval: str = "15m",
    limit: int = 20,
    db: Session = Depends(get_db),
):
    return get_generation_trend(
        db=db,
        limit=limit,
    )