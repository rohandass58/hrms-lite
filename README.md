# HRMS Lite

A lightweight, production-ready Human Resource Management System (HRMS) built with Django REST Framework and React (Vite). Manage employees and track attendance with a clean, modern UI.

---

## Features

- **Employee Management** — Add and delete employees with unique IDs and email validation
- **Attendance Tracking** — Mark daily attendance (Present / Absent) with duplicate prevention
- **Dashboard** — Real-time stat cards and per-employee attendance summary
- **Filtering** — Filter attendance records by employee and/or date simultaneously
- **Duplicate Detection** — 409 Conflict responses for duplicate employee ID, email, or attendance
- **Full API** — RESTful JSON API with consistent error responses

---

## Tech Stack

| Layer      | Technology                          | Version  |
|------------|-------------------------------------|----------|
| Frontend   | React                               | 18.x     |
| Bundler    | Vite                                | 5.x      |
| Routing    | React Router                        | v6       |
| HTTP       | Axios                               | 1.x      |
| Styling    | Tailwind CSS                        | 3.x      |
| Backend    | Python / Django                     | 3.11 / 4.x |
| API        | Django REST Framework               | 3.14     |
| Database   | PostgreSQL (via psycopg2)           | 14+      |
| Hosting FE | Vercel (free tier)                  |          |
| Hosting BE | Render (free tier)                  |          |
| DB Hosting | Render PostgreSQL / Supabase        |          |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Vercel)                      │
│                                                          │
│  React SPA (Vite)                                        │
│  ┌──────────┐  ┌───────────┐  ┌────────────┐            │
│  │Dashboard │  │ Employees │  │ Attendance │            │
│  └──────────┘  └───────────┘  └────────────┘            │
│        │               │               │                 │
│        └───────────────┴───────────────┘                 │
│                   Axios (API Layer)                       │
└───────────────────────┬─────────────────────────────────┘
                        │  HTTPS / JSON
┌───────────────────────▼─────────────────────────────────┐
│                  Django + DRF (Render)                   │
│                                                          │
│  /api/employees/    → employees app                      │
│  /api/attendance/   → attendance app                     │
│  /api/dashboard/    → dashboard_views.py                 │
│                                                          │
└───────────────────────┬─────────────────────────────────┘
                        │  psycopg2
┌───────────────────────▼─────────────────────────────────┐
│             PostgreSQL (Render / Supabase)               │
└─────────────────────────────────────────────────────────┘
```

---

## Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL (local or cloud)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/hrms-lite.git
cd hrms-lite
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and set your values:
#   SECRET_KEY, DATABASE_URL, etc.

python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver        # runs on http://localhost:8000
```

### 3. Frontend setup

```bash
cd ../frontend
npm install

cp .env.example .env
# .env already contains: VITE_API_BASE_URL=http://localhost:8000

npm run dev                       # runs on http://localhost:5173
```

---

## API Reference

### Employees

| Method | Endpoint                  | Description              | Body / Query Params |
|--------|---------------------------|--------------------------|---------------------|
| GET    | `/api/employees/`         | List all employees       | —                   |
| POST   | `/api/employees/`         | Create employee          | `employee_id`, `full_name`, `email`, `department` |
| DELETE | `/api/employees/<id>/`    | Delete employee          | —                   |

### Attendance

| Method | Endpoint                      | Description                      | Body / Query Params |
|--------|-------------------------------|----------------------------------|---------------------|
| GET    | `/api/attendance/`            | List attendance (filterable)     | `?employee_id=&date=` |
| POST   | `/api/attendance/`            | Mark attendance                  | `employee`, `date`, `status` |
| GET    | `/api/attendance/summary/`    | Per-employee present day count   | —                   |
| GET    | `/api/dashboard/`             | Dashboard aggregate stats        | —                   |

### Error Response Format

All errors return JSON:
```json
{ "error": "Human-readable message here" }
```

**HTTP Status Codes:** `200`, `201`, `204`, `400`, `404`, `409`, `500`

---

## Deployment

### Backend on Render

1. Create a **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo; set **Root Directory** to `backend`
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `gunicorn hrms.wsgi --log-file -`
5. Add these **Environment Variables** in Render:

   | Key                    | Value                                  |
   |------------------------|----------------------------------------|
   | `SECRET_KEY`           | A long random string                   |
   | `DEBUG`                | `False`                                |
   | `DATABASE_URL`         | PostgreSQL connection string           |
   | `ALLOWED_HOSTS`        | `yourapp.onrender.com`                 |
   | `CORS_ALLOWED_ORIGINS` | `https://yourapp.vercel.app`           |

6. Add a **PostgreSQL** database in Render → link it (sets `DATABASE_URL` automatically)
7. After first deploy, run migrations via Render Shell: `python manage.py migrate`

### Frontend on Vercel

1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. **Framework Preset:** Vite
4. **Environment Variable:**

   | Key                 | Value                              |
   |---------------------|------------------------------------|
   | `VITE_API_BASE_URL` | `https://yourapp.onrender.com`     |

5. Click **Deploy** ✓

---

## Assumptions & Limitations

- Employee deletion cascades to all their attendance records (by design, `on_delete=CASCADE`)
- Attendance is restricted to exactly "Present" or "Absent" — no partial or leave types
- No authentication in this lite version (suitable for internal/trusted network use)
- SQLite is used as fallback when no `DATABASE_URL` is set (for quick local testing without PostgreSQL)
- The free tier of Render spins down after inactivity — the first request after idle may be slow (~30s)

---

## Screenshots

> _Add screenshots of Dashboard, Employees, and Attendance pages here after deployment._

---

## License

MIT
