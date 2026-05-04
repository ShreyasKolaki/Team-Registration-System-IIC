from pymongo import MongoClient
from app.config.settings import settings

client = MongoClient(settings.MONGO_URI)
db = client[settings.DB_NAME]

users_collection = db["users"]
teams_collection = db["teams"]