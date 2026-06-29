from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


class UserCreate(BaseModel):
    email_id: EmailStr
    password: str


class UserLogin(BaseModel):
    email_id: EmailStr
    password: str


class CreateUser(BaseModel):
    first_name: str
    last_name: str
    dob: Optional[date] = None  # Safely allows optional or blank dates
    user_id: str
    contact_number: Optional[str] = None
    email_id: EmailStr
    password: str   


class UpdateUser(BaseModel):
    first_name: str
    last_name: str
    dob: Optional[date] = None  # FIX: Allows empty or null values during profiles updates
    user_id: str
    contact_number: Optional[str] = None # FIX: Prevents validation failure if phone is missing
    email_id: EmailStr
    role: str
    is_active: bool
    password: Optional[str] = None  # FIX: Lets the user payload pass through during password resets!

    class Config:
        from_attributes = True