# app/routes/auth.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.schemas.user_schema import UserRegister, UserLogin
from app.database.connection import users_collection
from app.utils.hash import hash_password, verify_password
from app.utils.jwt import create_token, decode_token
from app.config.settings import settings
from bson import ObjectId

router = APIRouter()
security = HTTPBearer()

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(creds.credentials)

    # ✅ Handle admin
    if payload.get("role") == "admin":
        return {
            "_id": "admin",
            "role": "admin",
            "email": settings.ADMIN_EMAIL
        }

    user = users_collection.find_one({"_id": ObjectId(payload["id"])})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    user["_id"] = str(user["_id"])
    return user

@router.post("/register")
def register(user: UserRegister):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    user_data = user.dict()
    user_data["password"] = hash_password(user.password)
    user_data["role"] = "user"

    result = users_collection.insert_one(user_data)

    token = create_token({"id": str(result.inserted_id)})

    user_data.pop("password")

    return {
        "token": token,
        "user": {
            **user_data,
            "_id": str(result.inserted_id)
        }
    }

@router.post("/login")
def login(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(401, "Invalid credentials")

    token = create_token({"id": str(db_user["_id"])})

    db_user["_id"] = str(db_user["_id"])

    return {"token": token, "user": db_user}

@router.post("/admin/login")
def admin_login(user: UserLogin):
    if user.email == settings.ADMIN_EMAIL and user.password == settings.ADMIN_PASSWORD:
        token = create_token({
            "id": "admin",
            "role": "admin"
        })

        return {
            "token": token,
            "user": {
                "_id": "admin",
                "email": settings.ADMIN_EMAIL,
                "role": "admin"
            }
        }

    raise HTTPException(status_code=401, detail="Invalid admin credentials")

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    return current_user