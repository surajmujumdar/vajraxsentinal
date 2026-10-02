from pydantic import BaseModel, EmailStr, Field
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

class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse

class TokenRefresh(BaseModel):
    refresh_token: str

class OTPVerifyRequest(BaseModel):
    email: Optional[str] = None
    otp_code: Optional[str] = None
    otp: Optional[str] = None
    code: Optional[str] = None
    mfa_session: Optional[str] = None

class OTPSendRequest(BaseModel):
    email: EmailStr

class LoginResponse(BaseModel):
    mfa_required: bool = True
    mfa_session: Optional[str] = None
    message: str
    token: Optional[Token] = None
