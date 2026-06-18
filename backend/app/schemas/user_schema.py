from pydantic import BaseModel,EmailStr


class UserCreate(BaseModel):
    email_id:EmailStr
    password: str


class UserLogin(BaseModel):
    email_id:EmailStr
    password:str
    

class CreateUser(BaseModel):
    email_id: EmailStr
    password: str   

class UpdateUser(BaseModel):
    email_id: str
    role: str
    is_active: bool