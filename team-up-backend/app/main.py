# app/main.py
from fastapi import FastAPI
from app.routes import auth, teams, admin
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ for development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(teams.router, prefix="/teams")
app.include_router(admin.router, prefix="/admin")