import uuid

from datetime import datetime
from datetime import date

from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import Date

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    email_id: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False
    )

    password: Mapped[str] = mapped_column(
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    role: Mapped[str] = mapped_column(
        String(20),
        default="USER"
    )

    # Required by Analytics Module
    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=True
    )

    # Frontend Fields

    first_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    last_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    dob: Mapped[date] = mapped_column(
        Date,
        nullable=False
    )

    user_id: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False
    )

    contact_number: Mapped[str] = mapped_column(
        String(15),
        nullable=False
    )