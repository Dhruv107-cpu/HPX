from fastapi import Depends
from fastapi import HTTPException

from app.auth.dependencies import get_current_user


def require_superadmin(
    current_user=Depends(get_current_user)
):

    if current_user.role != "SUPERADMIN":

        raise HTTPException(
            status_code=403,
            detail="Only SuperAdmin can access this resource"
        )

    return current_user