from fastapi import APIRouter, HTTPException, Depends
import time
from app.database.connection import teams_collection, users_collection
from app.utils.team_code import generate_team_code
from app.routes.auth import get_current_user
from bson import ObjectId

router = APIRouter()

EVENT_LIMITS = {
    "hackathon": (3, 4),
    "ideathon": (3, 4),
    "shark_tank": (3, 4),
    "nukkad_natak": (12, 18),
    "singing": (1, 1),
    "dance": (5, 7)
}

@router.post("")
def create_team(data: dict, user=Depends(get_current_user)):
    # FIX: API Bypass for Multiple Registrations
    existing_team = teams_collection.find_one({
        "event": data["event"],
        "members": user["_id"]
    })
    if existing_team:
        raise HTTPException(400, "You are already in a team for this event")

    code = generate_team_code()
    min_size, max_size = EVENT_LIMITS[data["event"]]

    team = {
        "name": data["name"],
        "event": data["event"],
        "code": code,
        "leader_id": user["_id"],
        "members": [user["_id"]],
        "min_size": min_size,
        "max_size": max_size,
        "payment_status": "verified",
        "transaction_id": data.get("transaction_id", ""),
        "whatsapp_link": "https://chat.whatsapp.com/dummy_group_" + code,
        "pending_requests": []
    }

    result = teams_collection.insert_one(team)
    team["_id"] = str(result.inserted_id)

    return team

@router.post("/join")
def join_team(data: dict, user=Depends(get_current_user)):
    team = teams_collection.find_one({"code": data["code"]})

    if not team:
        raise HTTPException(404, "Invalid team code")

    # FIX: API Bypass for Multiple Registrations
    existing_team = teams_collection.find_one({
        "event": team["event"],
        "members": user["_id"]
    })
    if existing_team:
        raise HTTPException(400, "You are already in a team for this event")

    if user["_id"] in team["members"]:
        raise HTTPException(400, "Already in team")

    if len(team["members"]) >= team["max_size"]:
        raise HTTPException(400, "Team full")

    teams_collection.update_one(
        {"_id": team["_id"]},
        {"$push": {"members": user["_id"]}}
    )

    team["_id"] = str(team["_id"])
    return team

@router.get("/me")
def my_teams(user=Depends(get_current_user)):
    teams = list(teams_collection.find({"members": user["_id"]}))
    for t in teams:
        t["_id"] = str(t["_id"])
    return teams

@router.get("/{team_id}")
def get_team(team_id: str):
    team = teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(404, "Team not found")
    team["_id"] = str(team["_id"])
    
    # Populate members
    member_ids = team.get("members", [])
    object_ids = [ObjectId(m) for m in member_ids if ObjectId.is_valid(m)]
    users = list(users_collection.find({"_id": {"$in": object_ids}}))
    
    populated_members = []
    for m in member_ids:
        user = next((u for u in users if str(u["_id"]) == m), None)
        if user:
            user["_id"] = str(user["_id"])
            if "password" in user:
                del user["password"]
            populated_members.append(user)
        else:
            populated_members.append(m)
    # Map pending_requests to strings for frontend compatibility
    raw_pending = team.get("pending_requests", [])
    if raw_pending and isinstance(raw_pending[0], dict):
        team["pending_requests"] = [r["user_id"] for r in raw_pending]
        
    team["members"] = populated_members
    return team

@router.post("/{team_id}/leave")
def leave_team(team_id: str, user=Depends(get_current_user)):
    team = teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(404, "Team not found")
        
    if team["leader_id"] == user["_id"]:
        raise HTTPException(400, "Leader cannot leave the team")
        
    if user["_id"] not in team["members"]:
        raise HTTPException(400, "You are not in this team")
        
    raw_pending = team.get("pending_requests", [])
    
    # Check if already pending
    for req in raw_pending:
        if isinstance(req, dict) and req["user_id"] == user["_id"]:
            # Check timeout (48 hours)
            if time.time() - req["time"] > 48 * 3600:
                # Auto-approve (Hostage Fix)
                teams_collection.update_one(
                    {"_id": ObjectId(team_id)},
                    {"$pull": {"members": user["_id"], "pending_requests": req}}
                )
                return {"ok": True, "message": "Force left team due to leader inactivity"}
            else:
                raise HTTPException(400, "Leave request already pending. Wait 48 hours to force leave.")
        elif isinstance(req, str) and req == user["_id"]:
            raise HTTPException(400, "Leave request already pending. Wait 48 hours to force leave.")

    # Convert existing string requests to dicts if needed (migration)
    teams_collection.update_one(
        {"_id": ObjectId(team_id)},
        {"$addToSet": {"pending_requests": {"user_id": user["_id"], "time": time.time()}}}
    )
    return {"ok": True}

@router.post("/{team_id}/resolve-leave")
def resolve_leave(team_id: str, data: dict, user=Depends(get_current_user)):
    team = teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(404, "Team not found")
        
    if team["leader_id"] != user["_id"]:
        raise HTTPException(403, "Only leader can resolve requests")
        
    target_user_id = data.get("user_id")
    action = data.get("action") # "approve" or "reject"
    
    # action == "approve" or "reject"
    
    # We must pull either the dict or the string
    # Easiest way is to pull both formats to be safe
    pull_query = {
        "pending_requests": target_user_id
    }
    
    if action == "approve":
        teams_collection.update_one(
            {"_id": ObjectId(team_id)},
            {"$pull": {"members": target_user_id, "pending_requests": target_user_id}}
        )
        # Also try pulling the dict format
        teams_collection.update_one(
            {"_id": ObjectId(team_id)},
            {"$pull": {"pending_requests": {"user_id": target_user_id}}}
        )
    else:
        teams_collection.update_one(
            {"_id": ObjectId(team_id)},
            {"$pull": {"pending_requests": target_user_id}}
        )
        teams_collection.update_one(
            {"_id": ObjectId(team_id)},
            {"$pull": {"pending_requests": {"user_id": target_user_id}}}
        )
        
    return {"ok": True}

@router.post("/{team_id}/transfer-leadership")
def transfer_leadership(team_id: str, data: dict, user=Depends(get_current_user)):
    team = teams_collection.find_one({"_id": ObjectId(team_id)})
    if not team:
        raise HTTPException(404, "Team not found")
        
    if team["leader_id"] != user["_id"]:
        raise HTTPException(403, "Only the current leader can transfer leadership")
        
    new_leader_id = data.get("new_leader_id")
    if not new_leader_id or new_leader_id not in team["members"]:
        raise HTTPException(400, "New leader must be an existing team member")
        
    teams_collection.update_one(
        {"_id": ObjectId(team_id)},
        {"$set": {"leader_id": new_leader_id}}
    )
    
    return {"ok": True}