from app.scheduler.scheduler import scheduler


def start_scheduler():
    """
    Start the scheduler if it is not already running.
    """
    if not scheduler.running:
        scheduler.start()
        print("✅ Scheduler started.")


def stop_scheduler():
    """
    Stop the scheduler if it is running.
    """
    if scheduler.running:
        scheduler.shutdown(wait=False)
        print("🛑 Scheduler stopped.")


def scheduler_status():
    """
    Return scheduler running status.
    """
    return {
        "running": scheduler.running
    }