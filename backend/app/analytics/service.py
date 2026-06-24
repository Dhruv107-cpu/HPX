import os
import re

from datetime import datetime

from sqlalchemy.orm import Session
import pandas as pd

from app.analytics.models import (
    UploadedFile,
    RegionCapacity,
    StateCapacity
)

ENERGY_MAPPING = {

    "Coal": "THERMAL",
    "Lignite": "THERMAL",
    "Gas": "THERMAL",
    "Diesel": "THERMAL",

    "Hydro": "RENEWABLE",
    "RES": "RENEWABLE",

    "Nuclear": "NUCLEAR"
}
STATE_REGION_MAPPING = {
    "Delhi": "Northern",
    "Haryana": "Northern",
    "Himachal Pradesh": "Northern",
    "Jammu & Kashmir": "Northern",
    "Punjab": "Northern",
    "Rajasthan": "Northern",
    "Uttar Pradesh": "Northern",
    "Uttarakhand": "Northern",
    "Chandigarh": "Northern",

    "Maharashtra": "Western",
    "Gujarat": "Western",
    "Goa": "Western",
    "Madhya Pradesh": "Western",
    "Chhattisgarh": "Western",
    "Daman & Diu": "Western",
    "Dadra & Nagar Haveli": "Western",

    "Tamil Nadu": "Southern",
    "Karnataka": "Southern",
    "Kerala": "Southern",
    "Andhra Pradesh": "Southern",
    "Telangana": "Southern",
    "Puducherry": "Southern",
    "Lakshadweep": "Southern",

    "Bihar": "Eastern",
    "Jharkhand": "Eastern",
    "Odisha": "Eastern",
    "West Bengal": "Eastern",
    "Sikkim": "Eastern",

    "Assam": "North Eastern",
    "Arunachal Pradesh": "North Eastern",
    "Manipur": "North Eastern",
    "Meghalaya": "North Eastern",
    "Mizoram": "North Eastern",
    "Nagaland": "North Eastern",
    "Tripura": "North Eastern",
    "Jammu and Kashmir": "Northern",
"Ladakh": "Northern",
}
REGIONS = {
    "Northern",
    "Western",
    "Eastern",
    "Southern",
    "North Eastern"
}

def get_report_date_from_filename(
    filename: str
):

    match = re.search(
        r"(\d{4})-(\d{2})",
        filename
    )

    if match:

        year = int(
            match.group(1)
        )

        month = int(
            match.group(2)
        )

        return datetime(
            year,
            month,
            1
        )

    return datetime.utcnow()

def process_region_file(
    file_path,
    upload_file_id,
    current_user,
    db: Session
):

    df = pd.read_excel(
        file_path,
        header=None,
        engine="xlrd"
    )

    report_date = get_report_date_from_filename(
        os.path.basename(file_path)
    )

    current_region = None

    energy_columns = {}

    for col in df.columns:

        header = df.iloc[4, col]

        if pd.notna(header):

            header = str(header).strip()

            if header not in [
                "Total",
                "Grand Total"
            ]:

                energy_columns[col] = header

    for index in range(
        5,
        len(df)
    ):

        total_check = str(
            df.iloc[index, 1]
        ).upper()

        if "TOTAL OF" in total_check:
            continue

        region_value = df.iloc[index, 7]

        if pd.notna(region_value):

            region_text = (
                str(region_value)
                .strip()
            )

            if (
                region_text
                and not region_text.isdigit()
            ):

                current_region = (
                    region_text
                )

                continue

        sector_value = df.iloc[index, 4]

        if pd.isna(sector_value):
            continue

        sector_type = (
            str(sector_value)
            .strip()
        )

        if not current_region:
            continue

        for col, energy_source in (
            energy_columns.items()
        ):

            value = df.iloc[
                index,
                col
            ]

            if pd.isna(value):
                continue

            try:
                value = float(value)
            except (
                TypeError,
                ValueError
            ):
                continue

            if value == 0:
                continue

            energy_category = (
                ENERGY_MAPPING.get(
                    energy_source,
                    "OTHER"
                )
            )

            record = RegionCapacity(

                upload_file_id=upload_file_id,

                region=current_region,

                sector_type=sector_type,

                energy_category=energy_category,

                energy_source=energy_source,

                capacity=value,

                created_at=report_date,

                created_on=datetime.utcnow(),

                uploaded_by_email=current_user.email_id,

                uploaded_by_username=current_user.username,

                updated_on=datetime.utcnow(),

                updated_by_email=current_user.email_id,

                updated_by_username=current_user.username
            )

            db.add(record)

    print(
        "REGION IMPORT COMPLETE"
    )
def process_state_file(
    file_path,
    upload_file_id,
    current_user,
    db: Session
):

    df = pd.read_excel(
        file_path,
        header=None,
        engine="xlrd"
    )

    report_date = get_report_date_from_filename(
        os.path.basename(file_path)
    )

    current_state = None

    energy_columns = {}

    for col in df.columns:

        header = df.iloc[4, col]

        if pd.notna(header):

            header = str(header).strip()

            if header not in [
                "Total",
                "Grand Total"
            ]:

                energy_columns[col] = header

    for index in range(
        5,
        len(df)
    ):

        total_check = str(
            df.iloc[index, 1]
        ).upper()

        if "TOTAL OF" in total_check:
            continue

        state_value = df.iloc[index, 1]

        if pd.notna(state_value):

            state_text = (
                str(state_value)
                .strip()
            )

            if (
                state_text
                and not state_text.isdigit()
                and "TOTAL OF"
                not in state_text.upper()
            ):

                if state_text in REGIONS:
                    continue

                current_state = state_text

                print(
                    "CURRENT STATE =",
                    current_state
                )

                continue

        sector_value = df.iloc[index, 3]

        if pd.isna(sector_value):
            continue

        sector_type = (
            str(sector_value)
            .strip()
        )

        if not current_state:
            continue

        region_name = (
            STATE_REGION_MAPPING.get(
                current_state,
                "UNKNOWN"
            )
        )

        for col, energy_source in (
            energy_columns.items()
        ):

            value = df.iloc[
                index,
                col
            ]

            if pd.isna(value):
                continue

            try:

                value = float(value)

            except (
                TypeError,
                ValueError
            ):
                continue

            if value == 0:
                continue

            energy_category = (
                ENERGY_MAPPING.get(
                    energy_source,
                    "OTHER"
                )
            )

            current_time = (
                datetime.utcnow()
            )

            print(
                "INSERTING",
                region_name,
                current_state,
                sector_type,
                energy_source,
                value
            )

            record = StateCapacity(

                upload_file_id=upload_file_id,

                region=region_name,

                state=current_state,

                sector_type=sector_type,

                energy_category=energy_category,

                energy_source=energy_source,

                capacity=value,

                created_at=report_date,

                created_on=current_time,

                uploaded_by_email=current_user.email_id,

                uploaded_by_username=current_user.username,

                updated_on=current_time,

                updated_by_email=current_user.email_id,

                updated_by_username=current_user.username
            )

            db.add(record)

    print(
        "STATE IMPORT COMPLETE"
    )

def save_uploaded_files(
    files,
    current_user,
    db: Session
):

    saved_files = []

    today = datetime.utcnow()

    upload_dir = os.path.join(
        "data",
        str(today.year),
        f"{today.month:02d}"
    )

    os.makedirs(
        upload_dir,
        exist_ok=True
    )

    for file in files:

        filename = os.path.basename(
            file.filename
        )

        print(
            "FILE NAME =",
            filename
        )

        file_path = os.path.join(
            upload_dir,
            filename
        )

        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(
                file.file.read()
            )

        if "capacity1" in filename.lower():

            file_type = "REGION"

        elif "capacity2" in filename.lower():

            file_type = "STATE"

        else:

            raise ValueError(
                f"Unsupported file: {filename}"
            )

        existing_file = (
            db.query(UploadedFile)
            .filter(
                UploadedFile.file_name == filename,
                UploadedFile.is_active == True
            )
            .first()
        )

        if existing_file:

            # deactivate previous version
            existing_file.is_active = False

            existing_file.updated_on = today

            existing_file.updated_by_email = (
                current_user.email_id
            )

            existing_file.updated_by_username = (
                current_user.username
            )

            # remove old analytics data
            db.query(
                RegionCapacity
            ).filter(
                RegionCapacity.upload_file_id
                == existing_file.id
            ).delete(
                synchronize_session=False
            )

            db.query(
                StateCapacity
            ).filter(
                StateCapacity.upload_file_id
                == existing_file.id
            ).delete(
                synchronize_session=False
            )

        upload_record = UploadedFile(

            file_name=filename,

            file_type=file_type,

            is_active=True,

            created_at=get_report_date_from_filename(
                filename
            ),

            created_on=today,

            uploaded_by_email=current_user.email_id,

            uploaded_by_username=current_user.username,

            # boss requirement
            updated_on=today,

            updated_by_email=current_user.email_id,

            updated_by_username=current_user.username,

            status="UPLOADED"
        )

        db.add(
            upload_record
        )

        db.flush()

        upload_file_id = (
            upload_record.id
        )

        print(
            "UPLOAD FILE ID =",
            upload_file_id
        )

        try:

            if file_type == "REGION":

                process_region_file(
                    file_path,
                    upload_file_id,
                    current_user,
                    db
                )

            elif file_type == "STATE":

                process_state_file(
                    file_path,
                    upload_file_id,
                    current_user,
                    db
                )

            upload_record.status = (
                "IMPORTED"
            )

        except Exception:

            upload_record.status = (
                "FAILED"
            )

            raise

        saved_files.append(
            filename
        )

    db.commit()

    return {
        "message": "Files Uploaded Successfully",
        "files": saved_files,
        "uploaded_by": current_user.username
    }