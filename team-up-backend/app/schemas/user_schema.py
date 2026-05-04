from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: str
    college: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str