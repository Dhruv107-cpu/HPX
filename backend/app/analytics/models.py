import uuid

from datetime import datetime

from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import DateTime
from sqlalchemy import ForeignKey

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from app.database.base import Base
from sqlalchemy import Boolean

class UploadedFile(Base):
    __tablename__ = "uploaded_files"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    file_name: Mapped[str] = mapped_column(
        String(255)
    )

    file_type: Mapped[str] = mapped_column(
        String(50)
    )

    

    created_at: Mapped[datetime] = mapped_column(
        DateTime
    )

    created_on: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    uploaded_by_email: Mapped[str] = mapped_column(
        String(255)
    )

    uploaded_by_username: Mapped[str] = mapped_column(
        String(255)
    )

    updated_on: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True
    )

    updated_by_email: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    updated_by_username: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(20)
    )
    is_active: Mapped[bool] = mapped_column(
    Boolean,
    default=True
)
class RegionCapacity(Base):
    __tablename__ = "region_capacity"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    upload_file_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("uploaded_files.id")
    )

    region: Mapped[str] = mapped_column(
        String(50)
    )

    sector_type: Mapped[str] = mapped_column(
        String(50)
    )

    energy_category: Mapped[str] = mapped_column(
        String(50)
    )

    energy_source: Mapped[str] = mapped_column(
        String(50)
    )

    capacity: Mapped[float] = mapped_column(
        Float
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime
    )

    created_on: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    uploaded_by_email: Mapped[str] = mapped_column(
        String(255)
    )

    uploaded_by_username: Mapped[str] = mapped_column(
        String(255)
    )

    updated_on: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True
    )

    updated_by_email: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    updated_by_username: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )
class StateCapacity(Base):
    __tablename__ = "state_capacity"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    upload_file_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("uploaded_files.id")
    )

    region: Mapped[str] = mapped_column(
        String(50)
    )

    state: Mapped[str] = mapped_column(
        String(50)
    )

    sector_type: Mapped[str] = mapped_column(
        String(50)
    )

    energy_category: Mapped[str] = mapped_column(
        String(50)
    )

    energy_source: Mapped[str] = mapped_column(
        String(50)
    )

    capacity: Mapped[float] = mapped_column(
        Float
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime
    )

    created_on: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    uploaded_by_email: Mapped[str] = mapped_column(
        String(255)
    )

    uploaded_by_username: Mapped[str] = mapped_column(
        String(255)
    )

    updated_on: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=True
    )

    updated_by_email: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    updated_by_username: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    

