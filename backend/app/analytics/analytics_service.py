from sqlalchemy import func
from sqlalchemy.orm import Session

from app.analytics.models import (
    RegionCapacity,
    StateCapacity,
    UploadedFile
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
