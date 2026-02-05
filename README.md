# Smart Vehicle Parking System 🚗🅿️

A full-stack web application to manage vehicle parking operations with real-time slot availability, reservations, role-based access, and automated background jobs (reports/notifications). Built for scalable, production-like workflows.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Local Setup](#local-setup)
  - [Run with Docker (Recommended)](#run-with-docker-recommended)
- [Database & Migrations](#database--migrations)
- [Background Jobs (Celery)](#background-jobs-celery)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment Notes](#deployment-notes)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### User & Access
- User authentication (login/register)
- Role-based access control (RBAC): **Admin / Operator / User**
- Secure API access (JWT/session-based auth — configurable)

### Parking Management
- Create/manage parking lots, floors/sections, and slots
- Live slot status: **Available / Occupied / Reserved**
- Vehicle entry/exit tracking with timestamps
- Slot allocation (manual or rule-based)

### Booking & Billing (Optional Modules)
- Reservation creation/cancellation
- Pricing rules: hourly/daily, grace period, penalties
- Invoice generation and payment status tracking

### Dashboards & Reports
- Admin dashboard: occupancy metrics, peak hours, revenue summary
- Export reports (CSV/Excel) via background tasks
- Audit logs for critical operations

### Automation (Celery + Redis)
- Scheduled tasks (daily summaries, exports, cleanup)
- Async tasks (email/WhatsApp notifications, report generation)

---

## Tech Stack

**Backend**
- Python + Flask (REST APIs)
- PostgreSQL (primary database)
- SQLAlchemy + Alembic (ORM + migrations)

**Async / Caching**
- Redis (cache + broker)
- Celery (background jobs, scheduling)

**Frontend**
- Vue.js 


---

## Architecture

Client (Web UI)
|
| HTTPS / REST
v
Flask API ---------------------> PostgreSQL
|
| (async tasks)
v
Celery Worker <---------------> Redis (broker/cache)
|
v
Exports / Notifications / Scheduled Jobs


---

## Project Structure

> Adjust names to match your repo.

vehicle-parking-app/
backend/
app/
api/ # route handlers / controllers
models/ # SQLAlchemy models
services/ # business logic
utils/ # helpers (auth, validators, constants)
tasks/ # celery tasks
config.py
init.py
migrations/ # Alembic migrations
requirements.txt
run.py
frontend/
src/
package.json
docker-compose.yml
.env.example
README.md


---

## Getting Started

### Prerequisites
- Python 3.10+ (or as per your project)
- Node.js 18+ (for frontend)
- PostgreSQL 14+
- Redis 6+
- (Optional) Docker + Docker Compose

### Environment Variables

Create `.env` at project root (or inside `backend/` based on your setup):

```env
# Flask
FLASK_ENV=development
SECRET_KEY=change-me

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/parking_db

# Redis / Celery
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Auth (optional)
JWT_SECRET=change-me
JWT_EXP_MIN=60
You can copy from:

cp .env.example .env
Local Setup
1) Backend
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate

pip install -r requirements.txt
2) Database
Create DB:

createdb parking_db
Run migrations:

flask db upgrade
Start backend:

python run.py
# or
flask run
Backend runs at:

http://localhost:5000

3) Frontend
cd ../frontend
npm install
npm run dev

cd C:\Users\user 1\Documents\vehicle_parking_app_22f2000914
venv\Scripts\activate
python -m celery -A app.celery worker --loglevel=info -P solo

python -m celery -A app.celery beat --loglevel=info
