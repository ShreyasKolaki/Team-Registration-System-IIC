# app/routes/admin.py
from fastapi import APIRouter, Depends
from app.database.connection import teams_collection, users_collection
from app.routes.auth import get_current_user
from bson import ObjectId
from fastapi import HTTPException

router = APIRouter()

def admin_only(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return user

@router.get("/teams")
def get_all_teams(user=Depends(admin_only)):
    teams = list(teams_collection.find())

    for team in teams:
        team["_id"] = str(team["_id"])
        team["leader_id"] = str(team["leader_id"])
        team["members"] = [str(m) for m in team["members"]]

    return teams

@router.get("/users")
def get_all_users(user=Depends(admin_only)):
    users = list(users_collection.find())

    for user in users:
        user["_id"] = str(user["_id"])

    return users