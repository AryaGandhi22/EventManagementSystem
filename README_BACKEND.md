# College Event Management — Backend

This project uses Django REST Framework with MongoDB Atlas through the official Django MongoDB Backend.

## 1. Requirements

- Python 3.10–3.14
- Node.js 18+ for the existing React/Vite frontend
- A MongoDB Atlas cluster/database

Django 5.2 supports Python 3.10–3.14. The MongoDB backend is configured through `ENGINE="django_mongodb_backend"`, `HOST=<MongoDB URI>`, and `NAME=<database name>`.

## 2. Configure MongoDB

Copy `.env.example` to `.env`:

### Windows CMD
```bat
copy .env.example .env
```

### PowerShell
```powershell
Copy-Item .env.example .env
```

Open `.env` and replace:

```text
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/?retryWrites=true&w=majority&appName=CollegeEventManagement
```

Do not commit `.env` to Git.

## 3. Backend setup

From the `CollegeEventManagement` folder:

```bat
py -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py runserver
```

Backend:
`http://127.0.0.1:8000/`

Health check: `http://127.0.0.1:8000/api/events/health/`

## 4. Frontend setup

Open a second terminal:

```bat
cd frontend
npm install
npm run dev
```

Frontend:
`http://localhost:5173/`

The frontend files have intentionally not been modified.

## 5. Optional demo data

After migrations, you can populate MongoDB with sample venues/events:

```bat
python manage.py seed_demo
```

This creates a demo staff user:

```text
username: demo_admin
password: DemoPass123!
```

Change/remove this demo account before any real deployment.

## 6. Authentication

### Register
```http
POST /api/events/auth/register/
Content-Type: application/json
```

Example:
```json
{
  "username": "student1",
  "email": "student1@example.com",
  "password": "StrongPass123",
  "first_name": "Student",
  "last_name": "One",
  "phone": "9876543210",
  "interests": ["Technical", "Sports"]
}
```

### Login
```http
POST /api/events/auth/login/
Content-Type: application/json
```

Example:
```json
{
  "username": "student1",
  "password": "StrongPass123"
}
```

The response contains `access` and `refresh` JWTs. For protected endpoints send:

```http
Authorization: Bearer <access-token>
```

## 7. Main API

All endpoints below are under `/api/events/`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `auth/register/` | Create account |
| POST | `auth/login/` | Login + JWT |
| POST | `auth/token/refresh/` | Refresh access token |
| POST | `auth/token/verify/` | Verify token |
| GET/PATCH | `auth/me/` | Current user/profile |
| GET/POST | `/` | List/create events |
| GET/PATCH/DELETE | `<event_id>/` | Event detail |
| GET | `dashboard/` | Dashboard statistics |
| GET | `reports/` | Report/attendance statistics |
| GET | `participants/` | Participant directory |
| GET/POST | `registrations/` | My registrations/create registration |
| GET/PATCH/DELETE | `registrations/<id>/` | Registration management |
| POST | `registrations/<id>/check-in/` | Check in |
| GET/POST | `feedback/` | Feedback |
| GET/PATCH/DELETE | `feedback/<id>/` | Feedback detail |
| GET/POST | `venues/` | Venues |
| GET/PATCH/DELETE | `venues/<id>/` | Venue detail |
| GET/PATCH | `profile/<user_id>/` | User profile |

## 8. Event rules implemented

- Event organizer is taken from the authenticated user; clients cannot impersonate another organizer.
- End time must be after start time.
- Venue cannot be double-booked for overlapping events.
- Event capacity cannot exceed the selected venue capacity.
- Registration is automatically `registered` until event capacity is reached.
- Further registrations become `waitlisted`.
- A user cannot register for the same event twice.
- Users cannot register after the event has ended.
- A registration can be cancelled.
- Only registered participants can check in.
- Check-in is allowed once the event has started.
- A user can submit feedback only for a registered event.
- Rating is restricted to 1–5.
- A user can submit only one feedback record per event.

## 9. Useful filters

Events:
```text
GET /api/events/?search=tech
GET /api/events/?category=Technical
GET /api/events/?upcoming=true
GET /api/events/?venue=<venue_id>
```

Venues:
```text
GET /api/events/venues/?search=auditorium
GET /api/events/venues/?availability=available
GET /api/events/venues/?availability=booked
```

Registrations:
```text
GET /api/events/registrations/?status=registered
GET /api/events/registrations/?event=<event_id>
```

Staff can request all registrations with:
```text
GET /api/events/registrations/?all=true
```

## 10. Admin

Create an admin account:

```bat
python manage.py createsuperuser
```

Then open:

`http://127.0.0.1:8000/admin/`

## 11. Important security note

The original uploaded project contained a live MongoDB Atlas username/password in `.env`. The deliverable intentionally does **not** contain that credential. If that password is still active, rotate the MongoDB database-user password in Atlas before using the project again.
