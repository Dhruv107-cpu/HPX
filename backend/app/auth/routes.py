from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.schemas.user_schema import UserLogin

from app.database.dependencies import get_db

from app.users.models import User

from app.auth.security import verify_password
from app.auth.jwt_handler import create_access_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)



@router.post("/login")
def login(
    payload: UserLogin,
    db: Session = Depends(get_db)
):

    print("STEP 1")

    user = (
        db.query(User)
        .filter(
            User.email_id == payload.email_id
        )
        .first()
    )

    print("STEP 2", user)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid Email"
        )

    print("STEP 3")

    result = verify_password(
        payload.password,
        user.password
    )

    print("STEP 4", result)

    if not result:
        raise HTTPException(
            status_code=401,
            detail="Invalid Password"
        )

    print("STEP 5")

    access_token = create_access_token(
        {
            "sub": user.email_id
        }
    )

    print("STEP 6")

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }