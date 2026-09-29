# College Event Management — MongoDB Full Stack

A college event management system using **React + Vite** for the UI and **Django REST Framework + MongoDB Atlas** for the backend.

The original visual frontend has been preserved; API integration was added behind the existing pages so the UI now reads/writes real backend data.

## Stack

- React 19 + Vite
- React Router
- Lucide React
- Django 5.2
- Django REST Framework
- Simple JWT authentication
- MongoDB Atlas via Django MongoDB Backend

## First-time setup — Windows

### 1. MongoDB Atlas

Create/choose your Atlas cluster and database user.

In Atlas, add your current IP under **Security → Network Access**.

Copy `.env.example` to `.env`:

```bat
copy .env.example .env
```

Edit `.env` and set:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@REAL-CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DATABASE=college_event_management
```

Do not put the literal `<CLUSTER>` placeholder in the URI.

### 2. Backend

From `CollegeEventManagement_Final`:

```bat
py -m venv venv
venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python manage.py check
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Backend: http://127.0.0.1:8000/

Health: http://127.0.0.1:8000/api/events/health/

### 3. Frontend

Open a second terminal:

```bat
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173/

## Demo authentication

The frontend automatically authenticates against the seeded demo account so the existing UI can call protected APIs without requiring a new login screen:

```text
Username: demo_admin
Password: DemoPass123!
```

Run `python manage.py seed_demo` before first use.

The frontend stores the JWT access/refresh tokens in browser localStorage and automatically refreshes an expired access token.

## Functional frontend integration

The existing pages now call the backend for:

- Dashboard statistics and upcoming events
- Event search/filtering and registration
- Event creation
- Registration listing, filtering, cancellation and check-in
- Participant directory and participant creation
- Venue listing, filtering, creation and deletion
- Reports and CSV export
- Profile/settings updates
- Logout

The existing CSS and visual structure are retained. No new UI framework was introduced.

## API overview

```text
POST   /api/events/auth/login/
POST   /api/events/auth/register/
GET    /api/events/auth/me/
POST   /api/events/auth/token/refresh/

GET    /api/events/
POST   /api/events/
GET    /api/events/<id>/
PATCH  /api/events/<id>/
DELETE /api/events/<id>/

GET    /api/events/dashboard/
GET    /api/events/reports/

GET    /api/events/registrations/
POST   /api/events/registrations/
DELETE /api/events/registrations/<id>/
POST   /api/events/registrations/<id>/check-in/

GET    /api/events/participants/
GET    /api/events/venues/
POST   /api/events/venues/
PATCH  /api/events/venues/<id>/
DELETE /api/events/venues/<id>/

GET    /api/events/health/
```

## If the frontend shows a network error

Confirm both terminals are running:

```text
Terminal 1: python manage.py runserver
Terminal 2: npm run dev
```

Then verify:

```text
http://127.0.0.1:8000/api/events/health/
http://localhost:5173/
```

The frontend API base defaults to:

```text
http://127.0.0.1:8000/api/events
```

You can override it with `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/events
```
