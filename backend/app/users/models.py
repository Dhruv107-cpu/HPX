import uuid

from datetime import datetime

from sqlalchemy import String
from sqlalchemy import Boolean
from sqlalchemy import DateTime

from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(100)
    )

    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False
    )

    password_hash: Mapped[str] = mapped_column(
        nullable=False
    )

    contact: Mapped[str] = mapped_column(
        String(20)
    )

    role: Mapped[str] = mapped_column(
        String(20),
        default="USER"
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )