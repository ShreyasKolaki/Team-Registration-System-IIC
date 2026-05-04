from pydantic import BaseModel

class CreateTeam(BaseModel):
    name: str
    event: str
    transaction_id: str

class JoinTeam(BaseModel):
    code: str