# Campus Circle

A small college event platform for students and event coordinators. Students can discover events, register, view their attendance status, get interest-based suggestions, and print certificates. The event office can publish events and view live totals.

## Run it

```bash
docker compose up --build
```

Open `http://localhost:5173`.

Demo accounts:

- Student: `aarav@campus.edu` / `demo123`
- Admin: `admin@campus.edu` / `admin123`

The Flask API uses a persistent SQLite volume; delete the `event_data` Docker volume only if you want to reset the demo data.

## Stack

- React + Vite frontend served by Nginx
- Flask REST API with SQLite
- Docker Compose for local development & deployment
