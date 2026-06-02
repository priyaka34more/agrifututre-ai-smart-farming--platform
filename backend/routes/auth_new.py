"""
Authentication Routes for AgriFuture AI Backend
Handles user login and token management
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional
import os

from utils.jwt import verify_password, create_access_token, decode_token, extract_token_from_header

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Temporary hardcoded user for Phase A
HARDCODED_USER = {
    "email": "admin@agrifuture.com",
    "password": os.getenv("ADMIN_PASSWORD", "admin123"),  # Change in production
    "role": "admin",
    "name": "Admin User"
}

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserInfo(BaseModel):
    email: str
    role: str
    name: str

# Security scheme
security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token"""
    token = extract_token_from_header(credentials.credentials)
    
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return payload

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """User login endpoint"""
    
    # Verify credentials against hardcoded user
    if (login_data.email == HARDCODED_USER["email"] and 
        verify_password(login_data.password, HARDCODED_USER["password"])):
        
        # Generate access token
        access_token = create_access_token(
            data={
                "sub": HARDCODED_USER["email"],
                "email": HARDCODED_USER["email"],
                "role": HARDCODED_USER["role"],
                "name": HARDCODED_USER["name"]
            }
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user={
                "email": HARDCODED_USER["email"],
                "role": HARDCODED_USER["role"],
                "name": HARDCODED_USER["name"]
            }
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current user information"""
    return UserInfo(
        email=current_user.get("email", ""),
        role=current_user.get("role", ""),
        name=current_user.get("name", "")
    )
