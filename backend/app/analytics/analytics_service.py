from sqlalchemy import func
from sqlalchemy.orm import Session

from app.analytics.models import (
    RegionCapacity,
    StateCapacity,
    UploadedFile,
    DailyGeneration
)


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
