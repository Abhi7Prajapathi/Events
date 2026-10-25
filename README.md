# Campus Circle

[![Campus Circle CI/CD](https://github.com/Abhi7Prajapathi/Events/actions/workflows/ci.yml/badge.svg)](https://github.com/Abhi7Prajapathi/Events/actions/workflows/ci.yml)
[![Live Site](https://img.shields.io/badge/Live-campuscirclepmc.vercel.app-183d28?style=flat&logo=vercel)](https://campuscirclepmc.vercel.app)

A modern campus event management platform for **Er. Perumal Manimekalai College of Engineering**. Students can discover events, register with one click, get interest-based suggestions, receive automated transactional emails via Brevo, and view/print verified credentials. The event office can publish events (with Gemini AI assistance), manage rosters, verify attendance, export CSVs, and manage the student directory.

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

## Recent Updates

- **Database Migration:** Migrated the backend from local SQLite to a remote Neon PostgreSQL database (`psycopg2`), managing configuration via `python-dotenv` and `.env` files.
- **AI Integration (Gemini):** Integrated the new `google-genai` SDK to add an **AI Auto-Fill** feature for the admin dashboard. This allows event coordinators to generate polished event listings from a single prompt.
- **Rate Limit Resilience:** Added a robust multi-model fallback retry loop for AI generation (e.g., automatically switching between `gemini-3.5-flash` and `gemini-flash-latest`) to gracefully handle free-tier API quotas and 429 errors.
- **Vite Proxy Configuration:** Created a `vite.config.js` to correctly proxy frontend `/api` requests to the Flask backend running on port 5000 during local development.
- **Admin Features:** Added the ability for administrators to delete events (and their associated registrations) directly from the event cards on the Discover page.
- **Printable Certificates:** Built a custom, beautifully styled certificate modal that displays the student's name, event details, and automatically generated dates.
- **Digital Signatures:** Integrated an uploaded physical signature image into the certificate layout using CSS blending (`mix-blend-multiply`) for an authentic, print-ready document.
- **Mobile Responsiveness:** Made the application fully mobile-responsive across phones and tablets with collapsible hamburger navigation, flexible event grids, responsive registration forms, and mobile-friendly certificate modal.
- **Brevo Email Notifications:** Integrated Brevo (Sendinblue) transactional email API:
  - **Welcome Email:** Automatically dispatches a branded welcome email with student profile information upon account registration.
  - **Event Confirmation Email:** Sends a confirmation email with full event details (title, date, time, venue, category, description, and certificate instructions) upon event registration.
  - **Asynchronous Dispatch:** Emails are sent in background daemon threads so registration requests respond instantly.
  - **Diagnostic Endpoint:** Added `POST /api/test-email` to verify Brevo API credentials with a single test.
- **Admin Attendee Roster & Export:** Administrators can now view the complete roster of registered students for any event directly from the Discover event cards or the Admin Dashboard. Features include real-time attendee search (name, reg no, department), detailed student info, enrollment progress bars, and 1-click CSV attendance export.
