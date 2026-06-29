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
