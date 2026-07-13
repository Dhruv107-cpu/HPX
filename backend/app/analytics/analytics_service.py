from sqlalchemy import func,and_
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.analytics.models import (
    RegionCapacity,
    StateCapacity,
    UploadedFile,
    DailyGeneration,
    GenerationSummary,
    PowerStationGeneration,
)
from app.analytics.schemas import LiveGenerationTrend


def get_region_capacity_summary(
    db: Session
):

    results = (
    db.query(
        RegionCapacity.region,
        func.sum(
            RegionCapacity.capacity
        ).label("capacity")
    )
    .filter(
        func.upper(
            func.trim(
                RegionCapacity.region
            )
        ) != "ALL INDIA"
    )
    .group_by(
        RegionCapacity.region
    )
    .order_by(
        RegionCapacity.region
    )
    .all()
)

    response = []

    for row in results:

        response.append(
            {
                "name": row.region,
                "value": round(
                    row.capacity,
                    2
                )
            }
        )

    return response


def get_state_capacity_summary(
    region: str,
    db: Session
):

    results = (
    db.query(
        StateCapacity.state,
        func.sum(
            StateCapacity.capacity
        ).label("capacity")
    )
    .join(
        UploadedFile,
        StateCapacity.upload_file_id == UploadedFile.id
    )
    .filter(
        UploadedFile.is_active == True,
        func.upper(
            func.trim(
                StateCapacity.region
            )
        ) == region.strip().upper()
    )
    .group_by(
        StateCapacity.state
    )
    .order_by(
        func.sum(
            StateCapacity.capacity
        ).desc()
    )
    .all()
)

    response = []

    for row in results:

        response.append(
            {
                "name": row.state,
                "value": round(
                    row.capacity,
                    2
                )
            }
        )

    return response


def get_monthly_region_capacity_summary(
    db: Session
):

    # Group active region capacity rows by the uploaded file report month.
    report_month = func.to_char(
        UploadedFile.created_at,
        "YYYY-MM"
    ).label("report_month")

    results = (
    db.query(
        report_month,
        RegionCapacity.region,
        func.sum(
            RegionCapacity.capacity
        ).label("capacity")
    )
    .join(
        UploadedFile,
        RegionCapacity.upload_file_id == UploadedFile.id
    )
    .filter(
        UploadedFile.is_active == True,
        func.upper(
            func.trim(
                RegionCapacity.region
            )
        ) != "ALL INDIA"
    )
    .group_by(
        report_month,
        RegionCapacity.region
    )
    .order_by(
        report_month,
        RegionCapacity.region
    )
    .all()
)

    grouped = {}

    for row in results:

        grouped.setdefault(
            row.report_month,
            []
        ).append(
            {
                "region": row.region,
                "capacity": round(
                    row.capacity,
                    2
                )
            }
        )

    response = []

    for month, regions in grouped.items():

        response.append(
            {
                "month": month,
                "regions": regions
            }
        )

    return response


def get_monthly_state_capacity_summary(
    region: str | None,
    db: Session
):

    # Group active state capacity rows by report month, optionally narrowed to one region.
    report_month = func.to_char(
        UploadedFile.created_at,
        "YYYY-MM"
    ).label("report_month")

    query = (
    db.query(
        report_month,
        StateCapacity.state,
        func.sum(
            StateCapacity.capacity
        ).label("capacity")
    )
    .join(
        UploadedFile,
        StateCapacity.upload_file_id == UploadedFile.id
    )
    .filter(
        UploadedFile.is_active == True
    )
)

    if region:

        query = query.filter(
            func.upper(
                func.trim(
                    StateCapacity.region
                )
            ) == region.strip().upper()
        )

    results = (
    query
    .group_by(
        report_month,
        StateCapacity.state
    )
    .order_by(
        report_month,
        StateCapacity.state
    )
    .all()
)

    grouped = {}

    for row in results:

        grouped.setdefault(
            row.report_month,
            []
        ).append(
            {
                "state": row.state,
                "capacity": round(
                    row.capacity,
                    2
                )
            }
        )

    response = []

    for month, states in grouped.items():

        response.append(
            {
                "month": month,
                "states": states
            }
        )

    return response
def get_dgr_summary(
    db: Session
):

    result = (
        db.query(
            func.sum(
                DailyGeneration.installed_capacity_mw
            ).label("installed"),

            func.sum(
                DailyGeneration.monitored_capacity_mw
            ).label("monitored"),

            func.sum(
                DailyGeneration.today_program_mu
            ).label("today_program"),

            func.sum(
                DailyGeneration.today_actual_mu
            ).label("today_actual"),

            func.sum(
                DailyGeneration.deviation_mu
            ).label("deviation"),

            func.max(
                DailyGeneration.created_at
            ).label("report_date")
        )
        .join(
            UploadedFile,
            DailyGeneration.upload_file_id == UploadedFile.id
        )
        .filter(
            UploadedFile.is_active == True,
            func.upper(
                DailyGeneration.region
            ) == "ALL INDIA",
            DailyGeneration.sector == "Total"
        )
        .first()
    )

    return {
        "total_installed_capacity": round(result.installed or 0, 2),
        "total_monitored_capacity": round(result.monitored or 0, 2),
        "today_program": round(result.today_program or 0, 2),
        "today_actual": round(result.today_actual or 0, 2),
        "deviation": round(result.deviation or 0, 2),
        "report_date": result.report_date
    }
def get_dgr_region_summary(
    db: Session
):

    results = (
        db.query(

            DailyGeneration.region,

            func.sum(
                DailyGeneration.installed_capacity_mw
            ).label("installed"),

            func.sum(
                DailyGeneration.monitored_capacity_mw
            ).label("monitored"),

            func.sum(
                DailyGeneration.today_program_mu
            ).label("today_program"),

            func.sum(
                DailyGeneration.today_actual_mu
            ).label("today_actual"),

            func.sum(
                DailyGeneration.deviation_mu
            ).label("deviation"),

            DailyGeneration.deviation_percent

        )
        .join(
            UploadedFile,
            DailyGeneration.upload_file_id == UploadedFile.id
        )
        .filter(
            UploadedFile.is_active == True,
            func.upper(
                func.trim(
                    DailyGeneration.region
                )
            ) != "ALL INDIA",
            DailyGeneration.sector == "Total"
        )
        .group_by(
            DailyGeneration.region,
            DailyGeneration.deviation_percent
        )
        .order_by(
            DailyGeneration.region
        )
        .all()
    )

    response = []

    for row in results:

        response.append(
            {

                "name": row.region,

                "installed_capacity": round(
                    row.installed or 0,
                    2
                ),

                "monitored_capacity": round(
                    row.monitored or 0,
                    2
                ),

                "today_program": round(
                    row.today_program or 0,
                    2
                ),

                "today_actual": round(
                    row.today_actual or 0,
                    2
                ),

                "deviation": round(
                    row.deviation or 0,
                    2
                ),

                "deviation_percent": round(
                    row.deviation_percent or 0,
                    2
                )

            }
        )

    return response





def get_latest_live_generation_summary(db: Session):
    """
    Returns latest live generation snapshot.
    """

    return (
        db.query(GenerationSummary)
        .order_by(GenerationSummary.id.desc())
        .first()
    )


def get_live_generation_trend(
    db: Session,
    interval: str,
):
    """
    Returns historical trend data for charts.

    Supported intervals:
    - 15m
    - hourly
    - daily
    - monthly
    """

    valid_intervals = {"15m", "hourly", "daily", "monthly"}

    if interval not in valid_intervals:
        raise ValueError("Invalid interval.")

    # ==========================================================
    # 15 Minute Trend (Last 24 Hours)
    # ==========================================================
    if interval == "15m":

        start_time = datetime.utcnow() - timedelta(hours=24)

        records = (
            db.query(GenerationSummary)
            .filter(
                GenerationSummary.report_timestamp >= start_time
            )
            .order_by(
                GenerationSummary.report_timestamp.asc()
            )
            .all()
        )

        return [
            LiveGenerationTrend(
                time=record.report_timestamp.strftime("%H:%M"),
                demand_met=record.demand_met,
            )
            for record in records
        ]

    # ==========================================================
    # Hourly Trend (Last 7 Days)
    # ==========================================================
    elif interval == "hourly":

        start_time = datetime.utcnow() - timedelta(days=7)

        # Latest timestamp for every hour
        latest_per_hour = (
            db.query(
                func.date_trunc(
                    "hour",
                    GenerationSummary.report_timestamp
                ).label("hour"),

                func.max(
                    GenerationSummary.report_timestamp
                ).label("latest_timestamp"),
            )
            .filter(
                GenerationSummary.report_timestamp >= start_time
            )
            .group_by(
                func.date_trunc(
                    "hour",
                    GenerationSummary.report_timestamp
                )
            )
            .subquery()
        )

        records = (
            db.query(GenerationSummary)
            .join(
                latest_per_hour,
                and_(
                    GenerationSummary.report_timestamp
                    == latest_per_hour.c.latest_timestamp
                ),
            )
            .order_by(
                GenerationSummary.report_timestamp.asc()
            )
            .all()
        )

        return [
            LiveGenerationTrend(
                time=record.report_timestamp.strftime("%d %b %H:00"),
                demand_met=record.demand_met,
            )
            for record in records
        ]

        # ==========================================================
    # Daily Trend (Last 30 Days)
    # ==========================================================
    elif interval == "daily":

        start_time = datetime.utcnow() - timedelta(days=30)

        latest_per_day = (
            db.query(
                func.date_trunc(
                    "day",
                    GenerationSummary.report_timestamp
                ).label("day"),

                func.max(
                    GenerationSummary.report_timestamp
                ).label("latest_timestamp"),
            )
            .filter(
                GenerationSummary.report_timestamp >= start_time
            )
            .group_by(
                func.date_trunc(
                    "day",
                    GenerationSummary.report_timestamp
                )
            )
            .subquery()
        )

        records = (
            db.query(GenerationSummary)
            .join(
                latest_per_day,
                and_(
                    GenerationSummary.report_timestamp
                    == latest_per_day.c.latest_timestamp
                ),
            )
            .order_by(
                GenerationSummary.report_timestamp.asc()
            )
            .all()
        )

        return [
            LiveGenerationTrend(
                time=record.report_timestamp.strftime("%d %b"),
                demand_met=record.demand_met,
            )
            for record in records
        ]
        # ==========================================================
    # Monthly Trend (Last 12 Months)
    # ==========================================================
    elif interval == "monthly":

        start_time = datetime.utcnow() - timedelta(days=365)

        latest_per_month = (
            db.query(
                func.date_trunc(
                    "month",
                    GenerationSummary.report_timestamp
                ).label("month"),

                func.max(
                    GenerationSummary.report_timestamp
                ).label("latest_timestamp"),
            )
            .filter(
                GenerationSummary.report_timestamp >= start_time
            )
            .group_by(
                func.date_trunc(
                    "month",
                    GenerationSummary.report_timestamp
                )
            )
            .subquery()
        )

        records = (
            db.query(GenerationSummary)
            .join(
                latest_per_month,
                and_(
                    GenerationSummary.report_timestamp
                    == latest_per_month.c.latest_timestamp
                ),
            )
            .order_by(
                GenerationSummary.report_timestamp.asc()
            )
            .all()
        )

        return [
            LiveGenerationTrend(
                time=record.report_timestamp.strftime("%b %Y"),
                demand_met=record.demand_met,
            )
            for record in records
        ]
    return []
from sqlalchemy import func


def get_latest_power_station_data(
    db: Session,
    state_code: str | None = None,
    generation_type: str | None = None,
    limit: int = 20,
):
    """
    Return the latest snapshot.
    If state_code is provided, return the latest snapshot for that state.
    Otherwise return the latest snapshot overall.
    """

    query = db.query(PowerStationGeneration)

    if state_code:
        latest_fetch_time = (
            db.query(func.max(PowerStationGeneration.fetched_at))
            .filter(
                PowerStationGeneration.state_code == state_code
            )
            .scalar()
        )

        if latest_fetch_time is None:
            return []

        query = query.filter(
            PowerStationGeneration.state_code == state_code,
            PowerStationGeneration.fetched_at == latest_fetch_time,
        )

    else:
        latest_fetch_time = (
            db.query(func.max(PowerStationGeneration.fetched_at))
            .scalar()
        )

        if latest_fetch_time is None:
            return []

        query = query.filter(
            PowerStationGeneration.fetched_at == latest_fetch_time
        )

    if generation_type:
        query = query.filter(
            PowerStationGeneration.generation_type == generation_type
        )

    query = query.filter(
        PowerStationGeneration.scheduled_generation > 0
    )

    return (
        query.order_by(
            PowerStationGeneration.scheduled_generation.desc()
        )
        .limit(limit)
        .all()
    )