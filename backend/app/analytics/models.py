import uuid

from datetime import datetime
from sqlalchemy.sql import func

from sqlalchemy import String
from sqlalchemy import Float
from sqlalchemy import DateTime,Date
from sqlalchemy import ForeignKey

from sqlalchemy import Column, Integer


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
    storage_path: Mapped[str] = mapped_column(
    String(500)
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

class DailyGeneration(Base):
    __tablename__ = "daily_generation"

    id: Mapped[uuid.UUID] = mapped_column(
        
        primary_key=True,
        default=uuid.uuid4
    )

    upload_file_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("uploaded_files.id")
    )

    region: Mapped[str] = mapped_column(
        String(100)
    )

    sector: Mapped[str] = mapped_column(
        String(50)
    )

    installed_capacity_mw: Mapped[float] = mapped_column(
        Float
    )

    monitored_capacity_mw: Mapped[float] = mapped_column(
        Float
    )

    annual_target_mu: Mapped[float] = mapped_column(
        Float
    )

   
    today_program_mu: Mapped[float] = mapped_column(
        Float
    )

    today_actual_mu: Mapped[float] = mapped_column(
        Float
    )

    apr_program_mu: Mapped[float] = mapped_column(
        Float
    )

    apr_actual_mu: Mapped[float] = mapped_column(
        Float
    )

    deviation_mu: Mapped[float] = mapped_column(
        Float
    )

    deviation_percent: Mapped[float] = mapped_column(
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



class GenerationSummary(Base):
    __tablename__ = "live_generation_summary"

    id = Column(Integer, primary_key=True, index=True)

    # Time when MERIT data represents
    report_timestamp = Column(DateTime, nullable=False, index=True)

    # Time when HPX fetched the data
    fetched_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    # National KPIs
    demand_met = Column(Float, nullable=False)

    thermal_generation = Column(Float, nullable=False)

    gas_generation = Column(Float, nullable=False)

    nuclear_generation = Column(Float, nullable=False)

    hydro_generation = Column(Float, nullable=False)

    renewable_generation = Column(Float, nullable=False)

    storage_generation = Column(Float, nullable=False)

    other_generation = Column(Float, nullable=False)

    transnational_exchange = Column(Float, nullable=False)
    
class PowerStationGeneration(Base):
    __tablename__ = "power_station_generation"

    id = Column(Integer, primary_key=True, index=True)

    report_date = Column(Date, nullable=False)

    state_code = Column(String(10), nullable=False)

    station_name = Column(String(255), nullable=False)

    generation_type = Column(String(50), nullable=False)

    scheduled_generation = Column(Float, nullable=False)

    non_scheduled_generation = Column(Float, nullable=False)

    fetched_at = Column(DateTime, default=datetime.utcnow)
class GenerationTrend(Base):
    __tablename__ = "generation_trend"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    demand = Column(Float)

    thermal = Column(Float)

    hydro = Column(Float)

    renewable = Column(Float)

    gas = Column(Float)

    nuclear = Column(Float)

    storage = Column(Float)

    other = Column(Float)

    exchange = Column(Float)

    fetched_at = Column(
        DateTime,
        server_default=func.now(),
    )
