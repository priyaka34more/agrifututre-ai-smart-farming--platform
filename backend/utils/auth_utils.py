import os
import bcrypt

from datetime import (
    datetime,
    timedelta
)

from typing import Optional

from jose import (
    JWTError,
    jwt
)

from dotenv import load_dotenv

from fastapi import (
    Header,
    HTTPException
)

# =====================================================
# LOAD ENV
# =====================================================

load_dotenv()

# =====================================================
# JWT CONFIG
# =====================================================

SECRET_KEY = os.getenv("JWT_SECRET")

if not SECRET_KEY:

    raise ValueError(
        "CRITICAL: JWT_SECRET environment variable is not set!"
    )

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# =====================================================
# PASSWORD VERIFY
# =====================================================

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:

    return bcrypt.checkpw(

        plain_password.encode("utf-8"),

        hashed_password.encode("utf-8")
    )

# =====================================================
# PASSWORD HASH
# =====================================================

def get_password_hash(
    password: str
) -> str:

    salt = bcrypt.gensalt()

    return bcrypt.hashpw(

        password.encode("utf-8"),

        salt

    ).decode("utf-8")

# =====================================================
# CREATE JWT TOKEN
# =====================================================

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
):

    to_encode = data.copy()

    if expires_delta:

        expire = datetime.utcnow() + expires_delta

    else:

        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(

        to_encode,

        SECRET_KEY,

        algorithm=ALGORITHM
    )

    return encoded_jwt

# =====================================================
# DECODE TOKEN
# =====================================================

def decode_token(token: str):

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:

        return None

# =====================================================
# VERIFY TOKEN
# =====================================================

async def verify_token(
    authorization: str = Header(None)
):

    if not authorization:

        raise HTTPException(
            status_code=401,
            detail="Missing authorization header"
        )

    if not authorization.startswith("Bearer "):

        raise HTTPException(
            status_code=401,
            detail="Invalid token format"
        )

    token = authorization.split(" ")[1]

    payload = decode_token(token)

    if not payload:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return payload