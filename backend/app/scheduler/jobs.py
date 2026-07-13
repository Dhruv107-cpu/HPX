from datetime import datetime

from app.database.database import SessionLocal

from app.analytics.service import (
    fetch_live_generation_summary,
    parse_live_generation_summary,
    save_live_generation_summary,
    fetch_all_power_station_data,
)

from app.scheduler.scheduler import scheduler


def sync_live_generation():
    """
    Scheduled job for Live Generation Sync.
    """

    db = SessionLocal()

    try:

        print("\n========== LIVE GENERATION JOB ==========")

        html = fetch_live_generation_summary()

        parsed = parse_live_generation_summary(html)

        save_live_generation_summary(
            db=db,
            data=parsed,
        )

        print(
            f"✅ Live Generation Sync Completed "
            f"({datetime.now().strftime('%d-%m-%Y %H:%M:%S')})"
        )

    except Exception as e:

        print(f"❌ Live Generation Sync Failed: {e}")

    finally:

        db.close()


def sync_power_stations():
    """
    Scheduled job for Power Station Sync.
    """

    db = SessionLocal()

    try:

        print("\n========== POWER STATION JOB ==========")

        today = datetime.now().strftime("%d %b %Y")

        result = fetch_all_power_station_data(
            db=db,
            report_date=today,
        )

        print(
            f"States Processed : {result['states_processed']}"
        )

        print(
            f"Records Saved    : {result['records_saved']}"
        )

        print(
            f"Failed States    : {len(result['failed_states'])}"
        )

        print(
            f"✅ Power Station Sync Completed "
            f"({datetime.now().strftime('%d-%m-%Y %H:%M:%S')})"
        )

    except Exception as e:

        print(f"❌ Power Station Sync Failed: {e}")

    finally:

        db.close()


def register_jobs():
    """
    Register scheduler jobs.
    """

    scheduler.add_job(
        func=sync_live_generation,
        trigger="interval",
        minutes=15,
        id="live_generation",
        name="Live Generation Sync",
        replace_existing=True,
        max_instances=1,
    )

    scheduler.add_job(
        func=sync_power_stations,
        trigger="cron",
        hour=8,
        minute=0,
        id="power_station",
        name="Power Station Sync",
        replace_existing=True,
        max_instances=1,
    )

    print("✅ Scheduler jobs registered.")