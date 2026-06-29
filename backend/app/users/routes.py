from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.auth.dependencies import get_current_user
from app.auth.permissions import require_superadmin
from app.auth.security import hash_password
from app.database.dependencies import get_db
from app.schemas.user_schema import CreateUser, UpdateUser
from app.users.models import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_me(
    current_user=Depends(get_current_user)
):
    # Fixed: Returning all descriptive data attributes so your ProfilePage can access and render them
    return {
        "id": str(current_user.id),
        "user_id": current_user.user_id,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "dob": str(current_user.dob) if current_user.dob else None,
        "contact_number": current_user.contact_number,
        "email_id": current_user.email_id,
        "role": current_user.role,
        "is_active": current_user.is_active
    }


@router.post("/create")
def create_user(
    payload: CreateUser,
    db: Session = Depends(get_db),
    current_user=Depends(require_superadmin)
):
    # Check if duplicate email exists
    existing_email = (
        db.query(User)
        .filter(User.email_id == payload.email_id)
        .first()
    )
    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )

    # Check if duplicate customized user_id exists
    existing_user_id = (
        db.query(User)
        .filter(User.user_id == payload.user_id)
        .first()
    )
    if existing_user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID is already taken"
        )

    # Construct complete database model profile instance mapping from client data
    new_user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        dob=payload.dob,
        user_id=payload.user_id,
        contact_number=payload.contact_number,
        email_id=payload.email_id,
        password=hash_password(payload.password),
        role="USER",
        is_active=True
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "User Created Successfully"
    }


@router.get("/list")
def list_users(
    db: Session = Depends(get_db),
    current_user=Depends(require_superadmin)
):
    users = db.query(User).all()

    # FIX: Explicitly called .isoformat() on created_at to avoid JSON serialization crash
    return [
        {
            "id": str(user.id),
            "first_name": user.first_name,
            "last_name": user.last_name,
            "dob": str(user.dob) if user.dob else None,
            "user_id": user.user_id,
            "contact_number": user.contact_number,
            "email_id": user.email_id,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
        for user in users
    ]


@router.get("/stats/summary")
def user_stats(
    db: Session = Depends(get_db),
    current_user=Depends(require_superadmin)
):
    total_users = db.query(User).count()

    active_users = (
        db.query(User)
        .filter(User.is_active == True)
        .count()
    )

    inactive_users = (
        db.query(User)
        .filter(User.is_active == False)
        .count()
    )

    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": inactive_users
    }


@router.get("/{user_id}")
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_superadmin)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # FIX: Explicitly called .isoformat() on created_at here as well
    return {
        "id": str(user.id),
        "first_name": user.first_name,
        "last_name": user.last_name,
        "dob": str(user.dob) if user.dob else None,
        "user_id": user.user_id,
        "contact_number": user.contact_number,
        "email_id": user.email_id,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }


@router.put("/{user_id}")
def update_user(
    user_id: UUID,
    payload: UpdateUser,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)  # Allowed normal authenticated users to step in
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # SECURITY GUARDRAIL: Ensure standard users can ONLY update their own records.
    # Superadmins can modify anyone's record.
    if current_user.role != "SUPERADMIN" and current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to modify this user record profile."
        )

    # Dynamic modifications updating all descriptive form fields safely
    user.first_name = payload.first_name
    user.last_name = payload.last_name
    user.dob = payload.dob
    user.contact_number = payload.contact_number
    user.email_id = payload.email_id
    
    # Only allow system parameters updates if execution context is superadmin dashboard
    if current_user.role == "SUPERADMIN":
        user.user_id = payload.user_id
        user.role = payload.role
        user.is_active = payload.is_active

    # PASSWORD CHANGE FEATURE INTEGRATION:
    # Safely checks if password string exists on schema body and avoids placeholder overwrites
    payload_dict = payload.dict() if hasattr(payload, "dict") else payload.model_dump()
    if "password" in payload_dict and payload_dict["password"]:
        pwd = payload_dict["password"]
        if pwd and pwd != "UNCHANGED_PLACEHOLDER":
            user.password = hash_password(pwd)

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully"
    }


@router.delete("/{user_id}")
def delete_user_record(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_superadmin)
):
    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully"
    }