import os
import re

from datetime import datetime

from sqlalchemy.orm import Session
import pandas as pd
from fastapi import HTTPException
from fastapi.responses import FileResponse


from app.analytics.models import (
    UploadedFile,
    RegionCapacity,
    StateCapacity
)
from app.analytics.models import DailyGeneration

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
valid_sectors = {
    "THERMAL",
    "NUCLEAR",
    "HYDRO",
    "TOTAL",
    "Bhutan IMP.",
    "R.E.S"
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

def get_month_window(
    report_date: datetime
):

    month_start = datetime(
        report_date.year,
        report_date.month,
        1
    )

    if report_date.month == 12:

        next_month = datetime(
            report_date.year + 1,
            1,
            1
        )

    else:

        next_month = datetime(
            report_date.year,
            report_date.month + 1,
            1
        )

    return (
        month_start,
        next_month
    )

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

    report_date = get_report_date_from_excel(df)
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
            if current_region.upper() == "ALL INDIA":
                continue

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

    report_date = get_report_date_from_excel(df)
    

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

    for file in files:

        filename = os.path.basename(
            file.filename
        )

        print(
            "FILE NAME =",
            filename
        )

        # Folder structure based on report month
        folder_date = get_report_date_from_filename(
            filename
        )

        upload_dir = os.path.join(
            "data",
            "capacity",
            str(folder_date.year),
            f"{folder_date.month:02d}"
        )

        os.makedirs(
            upload_dir,
            exist_ok=True
        )

        file_path = os.path.join(
            upload_dir,
            filename
        )

        # Save uploaded file
        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(
                file.file.read()
            )

        # Read Excel to get actual report date
        df = pd.read_excel(
            file_path,
            header=None,
            engine="xlrd"
        )

        report_date = get_report_date_from_excel(
            df
        )

        # Detect file type
        if "capacity1" in filename.lower():

            file_type = "REGION"

        elif "capacity2" in filename.lower():

            file_type = "STATE"

        elif "dgr1" in filename.lower():

            file_type = "DGR"

        else:

            raise ValueError(
            f"Unsupported file: {filename}"
            )

        month_start, next_month = get_month_window(
            report_date
        )

        existing_file = (
            db.query(UploadedFile)
            .filter(
                UploadedFile.file_type == file_type,
                UploadedFile.created_at >= month_start,
                UploadedFile.created_at < next_month,
                UploadedFile.is_active == True
            )
            .first()
        )

        if existing_file:

            # Deactivate previous version
            existing_file.is_active = False

            existing_file.updated_on = today

            existing_file.updated_by_email = (
                current_user.email_id
            )

            existing_file.updated_by_username = (
                current_user.username
            )

            # Remove previous analytics data
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
            db.query(
                DailyGeneration
            ).filter(
                DailyGeneration.upload_file_id == existing_file.id
            ).delete(
                synchronize_session=False
            )


        upload_record = UploadedFile(

            file_name=filename,

            file_type=file_type,

            storage_path=file_path,

            is_active=True,

            created_at=report_date,

            created_on=today,

            uploaded_by_email=current_user.email_id,

            uploaded_by_username=current_user.username,

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
            elif file_type == "DGR":

                process_dgr_file(
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
def download_uploaded_file(
    file_id,
    db: Session
):

    uploaded_file = (
        db.query(
            UploadedFile
        )
        .filter(
            UploadedFile.id == file_id
        )
        .first()
    )

    if not uploaded_file:

        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    if not os.path.exists(
        uploaded_file.storage_path
    ):

        raise HTTPException(
            status_code=404,
            detail="Physical file not found"
        )

    return FileResponse(
        path=uploaded_file.storage_path,
        filename=uploaded_file.file_name,
        media_type="application/octet-stream"
    )
def get_uploaded_files(
    db: Session
):

    files = (
        db.query(
            UploadedFile
        )
        .order_by(
            UploadedFile.created_on.desc()
        )
        .all()
    )

    return files
def get_report_date_from_excel(df):

    for row in range(5):

        for col in range(len(df.columns)):

            value = df.iloc[row, col]

            if pd.isna(value):
                continue

            text = str(value)

            # Format: 31/05/2026
            match = re.search(
                r"(\d{2}/\d{2}/\d{4})",
                text
            )

            if match:

                return datetime.strptime(
                    match.group(1),
                    "%d/%m/%Y"
                )

            # Format: 24-Jun-2026
            match = re.search(
                r"(\d{2}-[A-Za-z]{3}-\d{4})",
                text
            )

            if match:

                return datetime.strptime(
                    match.group(1),
                    "%d-%b-%Y"
                )

    return datetime.utcnow()
def process_dgr_file(
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

    report_date = get_report_date_from_excel(df)

    current_region = None

    regions = [
        "Northern",
        "Western",
        "Southern",
        "Eastern",
        "North Eastern",
        "ALL INDIA"
    ]

    for index in range(6, len(df)):

        value = df.iloc[index, 1]

        if pd.isna(value):
            continue

        value = str(value).strip()

        # Detect Region
        if value in regions:

            current_region = value

            continue

        if current_region is None:
            continue

        if value.upper() == "TOTAL":
            sector = "Total"
        elif value in valid_sectors:
            sector = value
        else:
            continue

        try:

            record = DailyGeneration(

                upload_file_id=upload_file_id,

                region=current_region,

                sector=sector,

                installed_capacity_mw=parse_float(df.iloc[index, 5]),

                monitored_capacity_mw=parse_float(df.iloc[index, 6]),

                annual_target_mu=parse_float(df.iloc[index, 7]),

                today_program_mu=parse_float(df.iloc[index, 8]),

                today_actual_mu=parse_float(df.iloc[index, 9]),

                apr_program_mu=parse_float(df.iloc[index, 10]),

                apr_actual_mu=parse_float(df.iloc[index, 11]),

                deviation_mu=parse_float(df.iloc[index, 12]),

                deviation_percent=parse_float(df.iloc[index, 14]),

                created_at=report_date,

                created_on=datetime.utcnow(),

                uploaded_by_email=current_user.email_id,

                uploaded_by_username=current_user.username,

                updated_on=datetime.utcnow(),

                updated_by_email=current_user.email_id,

                updated_by_username=current_user.username

            )

            db.add(record)

        except Exception as e:

            print(
                f"DGR Error at row {index}: {e}"
            )

    print(
        "DGR IMPORT COMPLETE"
    )
def parse_float(value):

    if pd.isna(value):
        return 0.0

    try:

        return float(
            str(value).replace(",", "")
        )

    except:

        return 0.0