from sqlalchemy.orm import Session

from app.users.models import User
from app.auth.security import hash_password


def create_superadmin(db: Session):

    print("Checking for SuperAdmin...")

    existing_user = (
        db.query(User)
        .filter(
            User.email_id == "admin@hpx.com"
        )
        .first()
    )

    if existing_user:
        print("SuperAdmin already exists")
        return

    print("Creating SuperAdmin...")

    admin = User(
        email_id="admin@hpx.com",
        password=hash_password("Admin@123"),
        is_active=True
    )

    db.add(admin)
    db.commit()

    print("SuperAdmin Created Successfully")