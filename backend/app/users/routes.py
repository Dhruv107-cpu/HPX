from uuid import UUID

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

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
    return {
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

    existing_user = (
        db.query(User)
        .filter(User.email_id == payload.email_id)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    new_user = User(
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

    return [
        {
            "id": str(user.id),
            "email_id": user.email_id,
            "role": user.role,
            "is_active": user.is_active,
            "created_at": user.created_at
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

    return {
        "id": str(user.id),
        "email_id": user.email_id,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at
    }


@router.put("/{user_id}")
def update_user(
    user_id: UUID,
    payload: UpdateUser,
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

    user.email_id = payload.email_id
    user.role = payload.role
    user.is_active = payload.is_active

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully"
    }


@router.delete("/{user_id}")
def deactivate_user(
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

    user.is_active = False

    db.commit()

    return {
        "message": "User deactivated successfully"
    }