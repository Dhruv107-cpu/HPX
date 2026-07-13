from fastapi import APIRouter

from app.scheduler.manager import (
    start_scheduler,
    stop_scheduler,
    scheduler_status,
)

router = APIRouter(
    prefix="/scheduler",
    tags=["Scheduler"],
)


@router.get("/status")
def get_scheduler_status():
    return scheduler_status()


@router.post("/start")
def start():
    start_scheduler()

    return {
        "status": "success",
        "message": "Scheduler started."
    }


@router.post("/stop")
def stop():
    stop_scheduler()

    return {
        "status": "success",
        "message": "Scheduler stopped."
    }