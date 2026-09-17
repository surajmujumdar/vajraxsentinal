from pydantic import BaseModel, EmailStr
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    name: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenRefresh(BaseModel):
    refresh_token: str

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp_code: str
    mfa_session: Optional[str] = None

class OTPSendRequest(BaseModel):
    email: EmailStr

class LoginResponse(BaseModel):
    mfa_required: bool = True
    mfa_session: Optional[str] = None
    message: str
    token: Optional[Token] = None
