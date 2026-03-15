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



## License

MIT
