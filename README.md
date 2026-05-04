AURA Team-Based Event Registration System
This project is a modern event registration platform built with React, FastAPI, and MongoDB Atlas. It lets participants browse events, form teams, and register seamlessly, and provides a secure dashboard to manage their event participation.

Features
Secure JWT-based authentication
Web-based event exploration and team management
Participant dashboard for viewing registered events and team status
Protected routes to prevent unauthorized access
Modern glassmorphism-inspired UI
Data storage in MongoDB Atlas

Tech Stack
Frontend: React 19, TanStack Start & Router, Tailwind CSS 4
Backend: FastAPI
Database: MongoDB Atlas
Authentication: JWT, Passlib (Bcrypt)
Local testing: Vite & Uvicorn

Project Structure
team-up/
├── team-up-frontend/    # React/Vite frontend application
│   ├── src/             # Frontend source code, components, and routes
│   ├── package.json     # Bun/Node dependencies
│   └── vite.config.ts   # Vite configuration
├── team-up-backend/     # FastAPI backend application
│   ├── app/
│   │   ├── main.py      # FastAPI app, main routes
│   │   ├── routes/      # API endpoints (auth, events, teams)
│   │   ├── models/      # Database models
│   │   └── schemas/     # Pydantic schemas for validation
│   └── requirements.txt # Python dependencies
└── README.md

Environment Variables
Create a .env file in both the frontend and backend directories.

Required variables used by the code:

Backend (`team-up-backend/.env`):
MONGO_URI=your_mongodb_atlas_connection_string
SECRET_KEY=your_jwt_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

Frontend (`team-up-frontend/.env`):
VITE_API_URL=http://127.0.0.1:8000

Installation
Backend:
Create and activate a virtual environment.
Install dependencies:
pip install -r requirements.txt

Frontend:
Navigate to the frontend directory.
Install dependencies using Bun (or npm):
bun install

Run Locally
Start the FastAPI server (Backend):
cd team-up-backend
uvicorn app.main:app --reload

The backend will run by default at:
http://127.0.0.1:8000

Start the frontend development server:
cd team-up-frontend
bun run dev

The web UI will run by default at:
http://127.0.0.1:5173

Available Routes (Backend API)
GET /
Returns backend status.

POST /auth/login
Authenticates user and returns JWT token.

POST /auth/signup
Registers a new user.

GET /events
Retrieves a list of available events.

POST /teams
Creates a new team for an event.

POST /teams/join
Joins an existing team using a team code.

How the Event Registration Flow Works
The platform handles registrations in the following order:

User Registration / Login
Browsing and selecting an event
Creating a new team or entering a team code to join an existing team
After the final step:

the registration is stored in MongoDB Atlas
the user is redirected to their dashboard
the event and team details become visible in the participant dashboard

Participant Dashboard
Open the frontend web UI and navigate to the dashboard.
The dashboard supports:

viewing all registered events
checking team status, team code, and members
accessing event details and coordinator contact info

Troubleshooting
Frontend cannot connect to the backend
Check the following:

VITE_API_URL is correctly set in team-up-frontend/.env
FastAPI server is running on the specified port
No CORS errors in the browser console (ensure backend allows frontend origins)

MongoDB data is not showing
Check:

MONGO_URI is valid
your MongoDB Atlas IP access settings allow your current network

Notes
The frontend enforces authentication guards; unauthorized users are automatically redirected to login without UI flashes.
Ensure both frontend and backend servers are running concurrently for the full experience.
