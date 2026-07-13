import os
import re
import requests
import urllib3
from datetime import datetime,timedelta
from bs4 import BeautifulSoup
from app.analytics.models import GenerationSummary
from sqlalchemy import func
from app.analytics.models import GenerationTrend
from app.analytics.constants import STATE_MAPPING

from sqlalchemy.orm import Session
import pandas as pd
from fastapi import HTTPException
from fastapi.responses import FileResponse


from app.analytics.models import (
    UploadedFile,
    RegionCapacity,
    StateCapacity,
    DailyGeneration,
    PowerStationGeneration
)
from app.analytics.constants import STATE_MAPPING


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
TITLE_MAPPING = {
    "DEMAND MET": "demand_met",
    "THERMAL GENERATION": "thermal_generation",
    "GAS GENERATION": "gas_generation",
    "NUCLEAR GENERATION": "nuclear_generation",
    "HYDRO GENERATION": "hydro_generation",
    "RENEWABLE GENERATION": "renewable_generation",
    "STORAGE GENERATION": "storage_generation",
    "OTHER GENERATION": "other_generation",
    "TRANS NATIONAL EXCHANGE": "transnational_exchange",
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
    
# NOTE:
# verify=False is used only for local development because
# the local Python environment cannot validate the SSL certificate.
# Remove before deployment.
    
MERIT_BASE_URL = "https://meritindia.in"
SUMMARY_URL = f"{MERIT_BASE_URL}/Dashboard/BindAllIndiaMap"

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
def fetch_live_generation_summary():
    response = requests.get(
        SUMMARY_URL,
        timeout=30,
        verify=False   # Development only
    )

    response.raise_for_status()

    return response.text
def parse_live_generation_summary(html: str):
    """
    Parse MERIT dashboard HTML and return
    a dictionary matching LiveGenerationSummary model.
    """

    soup = BeautifulSoup(html, "html.parser")

    summary = {}

    cards = soup.find_all("div", class_="stat-card")

    for card in cards:
        title_div = card.find("div", class_="gen_title_sec")
        value_span = card.find("span", class_="counter")

        if not title_div or not value_span:
            continue

        # Convert title like:
        # DEMAND<br>MET
        # into
        # DEMAND MET
        title = title_div.get_text(" ", strip=True)

        # Remove multiple spaces/newlines
        title = re.sub(r"\s+", " ", title).upper()

        # Example:
        # "1,46,806" -> "146806"
        value = value_span.get_text(strip=True)
        value = value.replace(",", "").strip()

        try:
            value = float(value)
        except ValueError:
            value = 0.0

        if title in TITLE_MAPPING:
            summary[TITLE_MAPPING[title]] = value

    return {
        "report_timestamp": datetime.utcnow(),

        "demand_met": summary.get("demand_met", 0),

        "thermal_generation": summary.get("thermal_generation", 0),

        "gas_generation": summary.get("gas_generation", 0),

        "nuclear_generation": summary.get("nuclear_generation", 0),

        "hydro_generation": summary.get("hydro_generation", 0),

        "renewable_generation": summary.get("renewable_generation", 0),

        "storage_generation": summary.get("storage_generation", 0),

        "other_generation": summary.get("other_generation", 0),

        "transnational_exchange": summary.get(
            "transnational_exchange",
            0,
        ),
    }
def save_live_generation_summary(db, data):
    """
    Save parsed MERIT dashboard data into database.
    """

    record = GenerationSummary(**data)
     # New history table
    trend = GenerationTrend(
        demand=data["demand_met"],
        thermal=data["thermal_generation"],
        hydro=data["hydro_generation"],
        renewable=data["renewable_generation"],
        gas=data["gas_generation"],
        nuclear=data["nuclear_generation"],
        storage=data["storage_generation"],
        other=data["other_generation"],
        exchange=data["transnational_exchange"],
    )
        

    db.add(record)
    db.add(trend)
    db.commit()
    db.refresh(record)

    return record
def fetch_power_station_data(state_code: str, report_date: str):
    """
    Fetch power station generation data from MERIT India.
    """

    session = requests.Session()

    

    state_code = state_code.lower().strip()

    config = STATE_MAPPING.get(state_code)

    if config is None:
        raise ValueError(
            f"Unsupported state code: {state_code}"
        )

    page_name = config["page"]

    api_state_code = config["merit_code"]

    # ---------------------------------------------------------
    # STEP 1 : Open state page
    # ---------------------------------------------------------

    state_url = f"https://meritindia.in/state-data/{page_name}"

    page = session.get(
        state_url,
        verify=False,
        timeout=30,
    )

    page.raise_for_status()

    soup = BeautifulSoup(page.text, "html.parser")

    token = soup.find(
        "input",
        {"name": "__RequestVerificationToken"},
    )

    if token is None:
        raise Exception("Unable to establish MERIT session.")

    # ---------------------------------------------------------
    # STEP 2 : Fetch data
    # ---------------------------------------------------------

    api_url = (
        "https://meritindia.in/"
        "StateWiseDetails/GetPowerStationData"
    )

    payload = {
        "StateCode": api_state_code,
        "date": report_date,
    }

    headers = {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Content-Type": "application/json; charset=UTF-8",
        "Origin": "https://meritindia.in",
        "Referer": state_url,
        "X-Requested-With": "XMLHttpRequest",
    }

    response = session.post(
        api_url,
        json=payload,
        headers=headers,
        timeout=30,
        verify=False,
    )

    response.raise_for_status()

    data = response.json()
    
    

    if not isinstance(data, list):
        raise Exception("Unexpected response received from MERIT.")

    return data
   
def parse_power_station_data(
    raw_data: list,
    state_code: str,
    report_date: str,
):
    """
    Parse MERIT power station response into a normalized format.
    """

    parsed_data = []

    for station in raw_data:

        # Safe string extraction
        station_name = (
            station.get("PowerStationName") or ""
        ).strip()

        generation_type = (
            station.get("TypeOfGeneration") or ""
        ).strip()

        # Safe numeric extraction
        schedule_raw = station.get("Schedule")
        non_schedule_raw = station.get("NonSchedule")

        try:
            scheduled_generation = (
                float(
                    str(schedule_raw)
                    .replace(",", "")
                    .strip()
                )
                if schedule_raw not in (None, "")
                else 0.0
            )
        except (ValueError, TypeError):
            scheduled_generation = 0.0

        try:
            non_scheduled_generation = (
                float(
                    str(non_schedule_raw)
                    .replace(",", "")
                    .strip()
                )
                if non_schedule_raw not in (None, "")
                else 0.0
            )
        except (ValueError, TypeError):
            non_scheduled_generation = 0.0

        parsed_data.append(
            {
                "report_date": report_date,
                "state_code": state_code,
                "station_name": station_name,
                "generation_type": generation_type,
                "scheduled_generation": scheduled_generation,
                "non_scheduled_generation": non_scheduled_generation,
            }
        )

    return parsed_data
def save_power_station_data(
    db: Session,
    parsed_data: list,
):
    """
    Save parsed power station data into the database.
    Each fetch is stored as a historical snapshot.
    """

    # Nothing to save
    if not parsed_data:
        return 0

    # Skip snapshots where every station has zero scheduled generation
    if all(
        station["scheduled_generation"] == 0
        for station in parsed_data
    ):
        raise ValueError(
            "MERIT returned only zero generation values. Snapshot not saved."
        )

    saved_records = 0
    fetch_time = datetime.utcnow()

    for station in parsed_data:

        record = PowerStationGeneration(
            report_date=station["report_date"],
            state_code=station["state_code"],
            station_name=station["station_name"],
            generation_type=station["generation_type"],
            scheduled_generation=station["scheduled_generation"],
            non_scheduled_generation=station["non_scheduled_generation"],
            fetched_at=fetch_time,
        )

        db.add(record)
        saved_records += 1

    db.commit()

    return saved_records

def get_state_preview(
    db: Session,
    state_code: str,
):
    latest_fetch = (
        db.query(func.max(PowerStationGeneration.fetched_at))
        .filter(
            PowerStationGeneration.state_code == state_code
        )
        .scalar()
    )

    if latest_fetch is None:
        return None

    stations = (
        db.query(PowerStationGeneration)
        .filter(
            PowerStationGeneration.state_code == state_code,
            PowerStationGeneration.fetched_at == latest_fetch,
        )
        .all()
    )

    total_generation = sum(
        s.scheduled_generation
        for s in stations
    )

    renewable = sum(
        1
        for s in stations
        if s.generation_type.lower() == "renewable"
    )

    thermal = sum(
        1
        for s in stations
        if s.generation_type.lower() != "renewable"
    )

    STATE_NAMES = {
        "rj": "Rajasthan",
        "mh": "Maharashtra",
        "gj": "Gujarat",
        "up": "Uttar Pradesh",
        "mp": "Madhya Pradesh",
        # We'll expand this later
    }

    return {
        "state_name": STATE_MAPPING.get(
            state_code,
            {}
        ).get(
            "name",
            state_code.upper(),
        ),
        "state_code": state_code,
        "total_stations": len(stations),
        "scheduled_generation": total_generation,
        "renewable_stations": renewable,
        "thermal_stations": thermal,
    }
def get_generation_trend(
    db: Session,
    limit: int = 20,
):
    records = (
        db.query(GenerationTrend)
        .order_by(
            GenerationTrend.fetched_at.asc()
        )
        .limit(limit)
        .all()
    )

    return [
    {
        "time": r.fetched_at.strftime("%H:%M"),

        "demand_met": r.demand,

        "thermal_generation": r.thermal,

        "hydro_generation": r.hydro,

        "renewable_generation": r.renewable,

        "gas_generation": r.gas,

        "nuclear_generation": r.nuclear,

        "storage_generation": r.storage,

        "other_generation": r.other,
    }
    for r in records
]
def get_power_station_portfolio(
    db: Session,
    state_code: str,
):
    latest_fetch = (
        db.query(
            func.max(
                PowerStationGeneration.fetched_at
            )
        )
        .filter(
            PowerStationGeneration.state_code == state_code
        )
        .scalar()
    )

    if latest_fetch is None:
        return None

    stations = (
        db.query(PowerStationGeneration)
        .filter(
            PowerStationGeneration.state_code == state_code,
            PowerStationGeneration.fetched_at == latest_fetch,
        )
        .all()
    )

    total_scheduled_generation = sum(
        station.scheduled_generation
        for station in stations
    )

    total_non_scheduled_generation = sum(
        station.non_scheduled_generation
        for station in stations
    )

    thermal_generation = sum(
        station.scheduled_generation
        for station in stations
        if station.generation_type.lower() == "thermal"
    )

    hydro_generation = sum(
        station.scheduled_generation
        for station in stations
        if station.generation_type.lower() == "hydro"
    )

    renewable_generation = sum(
        station.scheduled_generation
        for station in stations
        if station.generation_type.lower() == "renewable"
    )

    gas_generation = sum(
        station.scheduled_generation
        for station in stations
        if station.generation_type.lower() == "gas"
    )

    nuclear_generation = sum(
        station.scheduled_generation
        for station in stations
        if station.generation_type.lower() == "nuclear"
    )

    STATE_NAMES = {
        "rj": "Rajasthan",
        "mh": "Maharashtra",
        "gj": "Gujarat",
        "up": "Uttar Pradesh",
        "mp": "Madhya Pradesh",
    }

    return {
        "state_name": STATE_NAMES.get(
            state_code,
            state_code.upper(),
        ),
        "state_code": state_code,
        "total_stations": len(stations),
        "total_scheduled_generation": total_scheduled_generation,
        "total_non_scheduled_generation": total_non_scheduled_generation,
        "thermal_generation": thermal_generation,
        "hydro_generation": hydro_generation,
        "renewable_generation": renewable_generation,
        "gas_generation": gas_generation,
        "nuclear_generation": nuclear_generation,
    }
def fetch_all_power_station_data(
    db: Session,
    report_date: str,
):
    """
    Fetch power station data for all supported states.

    For every state:
    - Try the requested report date.
    - If MERIT has not yet published valid data,
      automatically try previous dates.
    """

    records_saved = 0
    states_processed = 0
    failed_states = []

    for internal_code, state in STATE_MAPPING.items():

        try:

            result = fetch_latest_state_data(
                db=db,
                state_code=internal_code,
                report_date=report_date,
            )

            records_saved += result["records_saved"]

            states_processed += 1

        except Exception as e:

            failed_states.append(
                {
                    "state_code": internal_code,
                    "state_name": state["name"],
                    "merit_code": state["merit_code"],
                    "error": str(e),
                }
            )

    return {
        "status": "success",
        "states_processed": states_processed,
        "records_saved": records_saved,
        "failed_states": failed_states,
    }
def fetch_latest_state_data(
    db: Session,
    state_code: str,
    report_date: str,
    max_days_back: int = 5,
):
    """
    Fetch the latest available power station data for a state.

    If MERIT has not yet published data for the requested date,
    automatically check previous dates until valid generation
    data is found or the retry limit is reached.
    """

    current_date = datetime.strptime(
        report_date,
        "%d %b %Y",
    )

    last_error = None

    for _ in range(max_days_back):

        current_report_date = current_date.strftime(
            "%d %b %Y"
        )

        try:

            raw_data = fetch_power_station_data(
                state_code=state_code,
                report_date=current_report_date,
            )

            parsed_data = parse_power_station_data(
                raw_data=raw_data,
                state_code=state_code,
                report_date=current_report_date,
            )
            if not parsed_data:
                current_date -= timedelta(days=1)
                continue

            saved = save_power_station_data(
                db=db,
                parsed_data=parsed_data,
            )

            return {
                "records_saved": saved,
                "report_date": current_report_date,
            }

        except ValueError as e:

            last_error = str(e)

            # Only retry if MERIT returned an all-zero snapshot
            if "zero generation values" not in last_error.lower():
                raise

            current_date -= timedelta(days=1)

    raise ValueError(
        last_error
        or "Unable to fetch valid data."
    )