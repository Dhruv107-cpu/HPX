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
class LiveGenerationSummaryResponse(BaseModel):
    report_timestamp: datetime
    fetched_at: datetime

    demand_met: float
    thermal_generation: float
    gas_generation: float
    nuclear_generation: float
    hydro_generation: float
    renewable_generation: float
    storage_generation: float
    other_generation: float
    transnational_exchange: float

    class Config:
        from_attributes = True

class LiveGenerationTrend(BaseModel):
    time: str
    demand_met: float

    class Config:
        from_attributes = True

class PowerStationFetchResponse(BaseModel):
    status: str
    records_saved: int

class PowerStationResponse(BaseModel):
    report_date: datetime
    state_code: str
    station_name: str
    generation_type: str
    scheduled_generation: float
    non_scheduled_generation: float
    fetched_at: datetime

    class Config:
        from_attributes = True
class PowerStationAnalytics(BaseModel):
    station_name: str
    generation_type: str
    scheduled_generation: float
    non_scheduled_generation: float

    class Config:
        from_attributes = True
class StatePreviewResponse(BaseModel):
    state_name: str
    state_code: str
    total_stations: int
    scheduled_generation: float
    renewable_stations: int
    thermal_stations: int
class GenerationTrendResponse(BaseModel):
    time: str

    demand_met: float

    thermal_generation: float

    hydro_generation: float

    renewable_generation: float

    gas_generation: float

    nuclear_generation: float

    storage_generation: float

    other_generation: float

    class Config:
        from_attributes = True

class PowerStationPortfolioResponse(BaseModel):
    state_name: str
    state_code: str

    total_stations: int

    total_scheduled_generation: float

    total_non_scheduled_generation: float

    thermal_generation: float

    hydro_generation: float

    renewable_generation: float

    gas_generation: float

    nuclear_generation: float

    class Config:
        from_attributes = True
        
class PowerStationFetchAllResponse(BaseModel):
    status: str

    states_processed: int

    records_saved: int

    failed_states: list[dict]