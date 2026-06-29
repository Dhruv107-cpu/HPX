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

    # Updated to pass the required fields and prevent NotNullViolations
    admin = User(
        email_id="admin@hpx.com",
        password=hash_password("Admin@123"),
        is_active=True,
        role="SUPERADMIN",  # Match this string or enum with your user role setup
        first_name="Admin",
        last_name="HPX",
        dob="2026-01-01",  # Date format string for SQLAlchemy/PostgreSQL compatibility
        user_id="admin_001",
        contact_number="0000000000"
    )

    db.add(admin)
    db.commit()

    print("SuperAdmin Created Successfully")