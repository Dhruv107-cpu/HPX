# HPX Analytics Dashboard

HPX Analytics Dashboard is a full-stack power sector analytics platform that collects, stores, analyzes, and visualizes electricity generation data from the MERIT India portal. The project provides real-time analytics, historical trends, state-wise power station monitoring, portfolio visualization, and automated data synchronization through a scheduler.

---

# Features

## Live Generation Analytics

- Live Generation Summary
- Demand Met
- Demand Gap
- Thermal Generation
- Hydro Generation
- Renewable Generation
- Nuclear Generation
- Gas Generation
- Storage Generation
- Power Exchange
- Historical Trend Storage
- Manual Sync
- Scheduled Sync

---

## Power Station Analytics

- State-wise Power Station Dashboard
- Interactive India Map
- State Filter
- Generation Type Filter
- Top-N Stations
- Scheduled Generation
- Non-Scheduled Generation
- Portfolio Analytics
- Historical Snapshots
- Automatic Date Fallback
- Manual Sync
- Scheduled Sync

---

## Portfolio Dashboard

MERIT-style portfolio visualization including:

- State Generation
- Central ISGS
- Other ISGS
- Bilateral
- Power Exchange
- Generation Mix Pie Chart

---

## Scheduler

The application includes an APScheduler-based background scheduler.

Current Jobs:

| Job | Schedule |
|------|----------|
| Live Generation | Every 15 Minutes |
| Power Station Sync | Daily at 08:00 AM IST |

Scheduler is **disabled by default** and can be controlled through API endpoints.

---

# Tech Stack

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- APScheduler
- BeautifulSoup
- Requests
- Pydantic

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Recharts
- React Simple Maps

---

# Project Structure

```
HPX/
│
├── backend/
│   ├── app/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── database/
│   │   ├── exports/
│   │   ├── middleware/
│   │   ├── scheduler/
│   │   ├── schemas/
│   │   ├── users/
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│
├── postman/
│
└── README.md
```

---

# Database

PostgreSQL is used for storing historical analytics.

Main Tables

- users
- uploaded_files
- region_capacity
- state_capacity
- daily_generation
- generation_trend
- live_generation_summary
- power_station_generation

---

# Installation

## Backend

Create virtual environment

```bash
python -m venv venv
```

Activate

Windows

```bash
venv\Scripts\activate
```

Linux

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn app.main:app --reload
```

Backend URL

```
http://localhost:8000
```

Swagger

```
http://localhost:8000/docs
```

---

## Frontend

Install packages

```bash
npm install
```

Run

```bash
npm run dev
```

Frontend URL

```
http://localhost:3000
```

---

# Environment Variables

Create a `.env` file.

Example

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/hpx
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

# Database Restore

Using pgAdmin

1. Create a PostgreSQL database.
2. Right Click Database.
3. Restore.
4. Select the provided `.backup` file.
5. Restore database.

---

# Scheduler

Scheduler is **disabled by default**.

API Endpoints

Start Scheduler

```
POST /scheduler/start
```

Stop Scheduler

```
POST /scheduler/stop
```

Scheduler Status

```
GET /scheduler/status
```

---

# Data Flow

```
MERIT Portal
      │
      ▼
Analytics Services
      │
      ▼
Parser
      │
      ▼
PostgreSQL
      │
      ▼
FastAPI APIs
      │
      ▼
Next.js Dashboard
```

---

# Power Station Fetch Flow

```
Scheduler / Manual Sync
          │
          ▼
Fetch MERIT Data
          │
          ▼
Automatic Date Fallback
          │
          ▼
Parse Data
          │
          ▼
Save Historical Snapshot
          │
          ▼
Dashboard APIs
```

---

# API Modules

## Authentication

- Login
- JWT Authentication

---

## Live Analytics

- Summary
- Trends
- Manual Sync

---

## Power Station

- Fetch Single State
- Fetch All States
- Portfolio
- Analytics

---

## Scheduler

- Start
- Stop
- Status

---

# Current Limitations

- Some states on the MERIT portal do not publish recent power station data.
- Automatic date fallback searches previous dates to obtain the latest available dataset.
- Scheduler starts only when explicitly enabled.
- Time displayed depends on frontend formatting (recommended to use Asia/Kolkata timezone).

---

# Future Improvements

- Scheduler Dashboard
- Scheduler Logs
- Historical Analytics
- AI-based Forecasting
- State Comparison
- Alert System
- Email Notifications
- Export Reports
- Deployment Automation

---

# Development Notes

Power Station synchronization uses:

- Centralized State Mapping
- Automatic Date Fallback
- Historical Snapshot Storage

Scheduler reuses existing analytics services without duplicating business logic.

---

# Author

Developed by DHRUV GUPTA and ISHANI GOYAL as part of the HPX Analytics Internship Project.
