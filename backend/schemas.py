from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# =====================================================
# AUTH SCHEMAS
# =====================================================

class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: Optional[EmailStr] = None
    mobile: Optional[str] = Field(None, pattern=r"^\d{10}$")
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    password: str

class GoogleLogin(BaseModel):
    id_token: str
    email: EmailStr
    full_name: str
    google_id: str

class ForgotPassword(BaseModel):
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None

class VerifyOtp(BaseModel):
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    otp: str

class ResetPassword(BaseModel):
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    otp: str
    new_password: str = Field(..., min_length=6)

# =====================================================
# ADMIN SCHEMAS
# =====================================================

class AlertCreate(BaseModel):
    disease: str
    region: str
    severity: str = "Medium"
    message: str

class NewsCreate(BaseModel):
    title: str = Field(...)
    description: str = Field(...)
    image: str
    source: str = "AgriFuture"
    is_pinned: bool = False
