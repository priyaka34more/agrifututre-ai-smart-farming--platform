from fastapi import Depends, HTTPException

from utils.auth_utils import verify_token


def check_role(allowed_roles):

    async def role_dependency(
        payload: dict = Depends(verify_token)
    ):

        role = payload.get("role")

        if role not in allowed_roles:

            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        return payload

    return role_dependency