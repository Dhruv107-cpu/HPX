from app.scheduler.scheduler import scheduler
from app.scheduler.jobs import register_jobs


def start_scheduler():

    if scheduler.running:

        print("⚠️ Scheduler already running.")

        return

    register_jobs()

    scheduler.start()

    print("✅ Scheduler started.")
def stop_scheduler():
    """
    Stop the scheduler if it is running.
    """
    if scheduler.running:
        scheduler.shutdown(wait=True)
        print("🛑 Scheduler stopped.")


def scheduler_status():

    return {
        "running": scheduler.running,
        "jobs": [
            {
                "id": job.id,
                "name": job.name,
                "next_run": str(job.next_run_time)
            }
            for job in scheduler.get_jobs()
        ]
    }