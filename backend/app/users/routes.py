from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.permissions import require_superadmin
from app.auth.security import hash_password

from app.database.dependencies import get_db

from app.schemas.user_schema import CreateUser

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
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(
            User.email_id == payload.email_id
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists"
        )

    new_user = User(
        email_id=payload.email_id,
        password=hash_password(
            payload.password
        ),
        role="USER",
        is_active=True
    )

    db.add(new_user)
    db.commit()

    return {
        "message": "User Created Successfully"
    }