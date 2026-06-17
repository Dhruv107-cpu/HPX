from fastapi import Depends
from fastapi import HTTPException

from fastapi.security import OAuth2PasswordBearer

from jose import JWTError
from jose import jwt

from sqlalchemy.orm import Session

from app.database.dependencies import get_db

from app.config.settings import settings

from app.users.models import User


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid Token"
            )

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail="Invalid Token"
        )

    user = (
        db.query(User)
        .filter(
            User.email_id == email
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User Not Found"
        )

    return user