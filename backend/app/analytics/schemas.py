from pydantic import BaseModel
from datetime import datetime
from uuid import UUID


from datetime import datetime
from uuid import UUID

class UploadedFileResponse(
    BaseModel
):
    id: UUID

    file_name: str

    file_type: str

    status: str

    is_active: bool

    created_at: datetime

    created_on: datetime

    uploaded_by_email: str

    uploaded_by_username: str

    updated_on: datetime | None

    updated_by_username: str | None

    class Config:
        from_attributes = True



class RegionCapacitySummary(BaseModel):
    name: str
    value: float

    class Config:
        from_attributes = True


class StateCapacitySummary(BaseModel):
    name: str
    value: float

    class Config:
        from_attributes = True


class MonthlyRegionCapacity(BaseModel):
    region: str
    capacity: float


class MonthlyRegionCapacitySummary(BaseModel):
    month: str
    regions: list[
        MonthlyRegionCapacity
    ]


class MonthlyStateCapacity(BaseModel):
    state: str
    capacity: float


class MonthlyStateCapacitySummary(BaseModel):
    month: str
    states: list[
        MonthlyStateCapacity
    ]
class DGRSummary(BaseModel):

    total_installed_capacity: float

    total_monitored_capacity: float

    today_program: float

    today_actual: float

    deviation: float

    report_date: datetime


class DGRRegionSummary(BaseModel):

    name: str

    installed_capacity: float

    monitored_capacity: float

    today_program: float

    today_actual: float

    deviation: float

    deviation_percent: float
