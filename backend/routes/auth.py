import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import Optional
import uuid
import os
import random
import time
import requests

from database import SessionLocal
from models.user_model import User

from utils.auth_utils import (
    get_password_hash,
    verify_password,
    create_access_token
)

from utils.activity_logger import log_activity

# =====================================================
# ADMIN EMAIL
# =====================================================

ADMIN_EMAIL = os.getenv(
    "ADMIN_EMAIL",
    "admin@agrifuture.com"
)

# =====================================================
# ROUTER
# =====================================================

router = APIRouter()

GOOGLE_OAUTH_CLIENT_IDS = [
    client_id.strip()
    for client_id in os.getenv("GOOGLE_OAUTH_CLIENT_IDS", "").split(",")
    if client_id.strip()
]

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"

logger = logging.getLogger("agri_google_auth")
logger.setLevel(logging.INFO)

if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter("[%(asctime)s] %(levelname)s %(name)s: %(message)s"))
    logger.addHandler(handler)

logger.info("Google OAuth client IDs loaded: count=%d", len(GOOGLE_OAUTH_CLIENT_IDS))


def verify_google_id_token(id_token: str):
    logger.info("Verifying Google ID token")
    if not id_token:
        logger.error("Google ID token missing")
        raise HTTPException(status_code=400, detail="Google ID token is required.")

    if not GOOGLE_OAUTH_CLIENT_IDS:
        logger.error("Google OAuth client IDs are not configured")
        raise HTTPException(
            status_code=500,
            detail="Google OAuth client IDs are not configured. Set GOOGLE_OAUTH_CLIENT_IDS."
        )

    params = {"id_token": id_token}
    response = requests.get(GOOGLE_TOKEN_INFO_URL, params=params, timeout=10)

    if response.status_code != 200:
        logger.error("Google tokeninfo endpoint returned status %s", response.status_code)
        raise HTTPException(status_code=401, detail="Google token verification failed.")

    token_info = response.json()
    logger.info("Google token info received for aud=%s email=%s", token_info.get("aud"), token_info.get("email"))
    if token_info.get("aud") not in GOOGLE_OAUTH_CLIENT_IDS:
        logger.error("Google token audience mismatch: %s", token_info.get("aud"))
        raise HTTPException(status_code=401, detail="Google token audience is not valid.")

    if token_info.get("email_verified") != "true" and token_info.get("email_verified") is not True:
        logger.error("Google email not verified: %s", token_info.get("email_verified"))
        raise HTTPException(status_code=401, detail="Google email is not verified.")

    return token_info

# =====================================================
# DATABASE
# =====================================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()

# =====================================================
# SCHEMAS
# =====================================================

from schemas import (
    UserCreate,
    UserLogin,
    GoogleLogin,
    ForgotPassword,
    VerifyOtp,
    ResetPassword
)


# =====================================================
# REGISTER
# =====================================================

@router.post("/register")
def register(
    request: Request,
    user_in: UserCreate,
    db: Session = Depends(get_db)
):

    request_id = getattr(
        request.state,
        "request_id",
        "unknown"
    )

    # CHECK EMAIL OR MOBILE

    if not user_in.email and not user_in.mobile:

        raise HTTPException(
            status_code=400,
            detail="Email or mobile number required"
        )

    # CHECK EXISTING EMAIL

    if user_in.email:

        existing_email = db.query(User).filter(
            User.email == user_in.email
        ).first()

        if existing_email:

            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

    # CHECK EXISTING MOBILE

    if user_in.mobile:

        existing_mobile = db.query(User).filter(
            User.mobile == user_in.mobile
        ).first()

        if existing_mobile:

            raise HTTPException(
                status_code=400,
                detail="Mobile already registered"
            )

    # CREATE USER

    new_user = User(

        id=str(uuid.uuid4()),

        full_name=user_in.full_name,

        email=user_in.email,

        mobile=user_in.mobile,

        hashed_password=get_password_hash(
            user_in.password
        ),

        role="user",

        is_active=True
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    # LOG ACTIVITY

    log_activity(

        db=db,

        user_id=new_user.id,

        module="Authentication",

        action="Register",

        result="Success"
    )

    # CREATE TOKEN

    access_token = create_access_token(

        data={

            "sub":
            new_user.email
            or
            new_user.mobile,

            "id":
            new_user.id,

            "role":
            new_user.role
        }
    )

    return {

        "status": "success",

        "message":
        "Registration successful",

        "data": {

            "access_token":
            access_token,

            "token_type":
            "bearer",

            "role":
            new_user.role,

            "user": {

                "id":
                new_user.id,

                "full_name":
                new_user.full_name,

                "email":
                new_user.email,

                "mobile":
                new_user.mobile,

                "role":
                new_user.role
            }
        },

        "request_id":
        request_id
    }

# =====================================================
# LOGIN
# =====================================================

@router.post("/login")
def login(
    request: Request,
    user_in: UserLogin,
    db: Session = Depends(get_db)
):

    request_id = getattr(
        request.state,
        "request_id",
        "unknown"
    )

    # =================================================
    # SUPER ADMIN LOGIN
    # =================================================

    if (
        user_in.mobile == "9075331101"
        and
        user_in.password == "admin"
    ):

        admin = db.query(User).filter(
            User.mobile == "9075331101"
        ).first()

        if not admin:

            admin = User(

                id=str(uuid.uuid4()),

                mobile="9075331101",

                full_name=
                "AgriFuture Super Admin",

                role="admin",

                is_active=True
            )

            db.add(admin)

            db.commit()

            db.refresh(admin)

        access_token = create_access_token(

            data={

                "sub":
                admin.mobile,

                "id":
                admin.id,

                "role":
                "admin"
            }
        )

        return {

            "status": "success",

            "message":
            "Admin login successful",

            "data": {

                "access_token":
                access_token,

                "token_type":
                "bearer",

                "role":
                "admin",

                "user": {

                    "id":
                    admin.id,

                    "full_name":
                    admin.full_name,

                    "mobile":
                    admin.mobile,

                    "role":
                    "admin"
                }
            },

            "request_id":
            request_id
        }

    # =================================================
    # NORMAL LOGIN
    # =================================================

    user = None

    if user_in.email:

        user = db.query(User).filter(
            User.email == user_in.email
        ).first()

    elif user_in.mobile:

        user = db.query(User).filter(
            User.mobile == user_in.mobile
        ).first()

    else:

        raise HTTPException(
            status_code=400,
            detail="Email or mobile required"
        )

    # =================================================
    # USER CHECK
    # =================================================

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    if not user.hashed_password:

        raise HTTPException(
            status_code=401,
            detail="Password login unavailable"
        )

    if not verify_password(
        user_in.password,
        user.hashed_password
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials"
        )

    # =================================================
    # CREATE TOKEN
    # =================================================

    access_token = create_access_token(

        data={

            "sub":
            user.email
            or
            user.mobile,

            "id":
            user.id,

            "role":
            user.role
        }
    )

    # LOG ACTIVITY

    log_activity(

        db=db,

        user_id=user.id,

        module="Authentication",

        action="Login",

        result="Success"
    )

    return {

        "status": "success",

        "message":
        "Login successful",

        "data": {

            "access_token":
            access_token,

            "token_type":
            "bearer",

            "role":
            user.role,

            "user": {

                "id":
                user.id,

                "full_name":
                user.full_name,

                "email":
                user.email,

                "mobile":
                user.mobile,

                "role":
                user.role
            }
        },

        "request_id":
        request_id
    }

# =====================================================
# GOOGLE LOGIN
# =====================================================

@router.post("/google-login")
def google_login(
    request: Request,
    user_in: GoogleLogin,
    db: Session = Depends(get_db)
):

    request_id = getattr(
        request.state,
        "request_id",
        "unknown"
    )

    logger.info("Google login request received request_id=%s", request_id)
    token_info = verify_google_id_token(user_in.id_token)
    google_id = token_info.get("sub")
    email = token_info.get("email")
    full_name = token_info.get("name") or user_in.full_name

    logger.info("Google token validated for email=%s google_id=%s", email, google_id)
    user = db.query(User).filter(
        User.google_id == google_id
    ).first()

    if not user:
        user = db.query(User).filter(
            User.email == email
        ).first()

        if user:
            logger.info("Linking existing user email=%s to google_id=%s", email, google_id)
            user.google_id = google_id
        else:
            logger.info("Creating new user for email=%s", email)
            user = User(
                id=str(uuid.uuid4()),
                email=email,
                full_name=full_name,
                google_id=google_id,
                role="user",
                is_active=True
            )
            db.add(user)

        db.commit()
        db.refresh(user)

    logger.info("Creating JWT for user_id=%s email=%s role=%s", user.id, user.email, user.role)

    access_token = create_access_token(

        data={

            "sub":
            user.email,

            "id":
            user.id,

            "role":
            user.role
        }
    )

    return {

        "status": "success",

        "message":
        "Google login successful",

        "data": {

            "access_token":
            access_token,

            "token_type":
            "bearer",

            "role":
            user.role
        },

        "request_id":
        request_id
    }

# =====================================================
# FORGOT PASSWORD FLOW
# =====================================================

@router.post("/forgot-password")
def forgot_password(
    request: Request,
    user_in: ForgotPassword,
    db: Session = Depends(get_db)
):
    if not user_in.email and not user_in.mobile:
        raise HTTPException(status_code=400, detail="Email or mobile required")

    user = None
    if user_in.email:
        user = db.query(User).filter(User.email == user_in.email).first()
    elif user_in.mobile:
        user = db.query(User).filter(User.mobile == user_in.mobile).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Generate 6 digit OTP
    otp = str(random.randint(100000, 999999))
    expiry = int(time.time()) + 300  # 5 mins

    user.reset_token = f"{otp}:{expiry}"
    db.commit()

    # Simulate OTP in console
    print(f"=====================================")
    print(f"🔒 OTP for {user_in.email or user_in.mobile}: {otp}")
    print(f"=====================================")

    return {"status": "success", "message": "OTP sent successfully (Check backend console)"}

@router.post("/verify-otp")
def verify_otp(
    request: Request,
    user_in: VerifyOtp,
    db: Session = Depends(get_db)
):
    if not user_in.email and not user_in.mobile:
        raise HTTPException(status_code=400, detail="Email or mobile required")

    user = None
    if user_in.email:
        user = db.query(User).filter(User.email == user_in.email).first()
    elif user_in.mobile:
        user = db.query(User).filter(User.mobile == user_in.mobile).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.reset_token or ":" not in user.reset_token:
        raise HTTPException(status_code=400, detail="No OTP requested")

    stored_otp, expiry = user.reset_token.split(":")
    if int(time.time()) > int(expiry):
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")

    if stored_otp != user_in.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    return {"status": "success", "message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(
    request: Request,
    user_in: ResetPassword,
    db: Session = Depends(get_db)
):
    if not user_in.email and not user_in.mobile:
        raise HTTPException(status_code=400, detail="Email or mobile required")

    user = None
    if user_in.email:
        user = db.query(User).filter(User.email == user_in.email).first()
    elif user_in.mobile:
        user = db.query(User).filter(User.mobile == user_in.mobile).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not user.reset_token or ":" not in user.reset_token:
        raise HTTPException(status_code=400, detail="No OTP requested")

    stored_otp, expiry = user.reset_token.split(":")
    if int(time.time()) > int(expiry):
        raise HTTPException(status_code=400, detail="OTP expired. Please request a new one.")

    if stored_otp != user_in.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    # Update password
    user.hashed_password = get_password_hash(user_in.new_password)
    user.reset_token = None
    db.commit()

    return {"status": "success", "message": "Password reset successfully"}