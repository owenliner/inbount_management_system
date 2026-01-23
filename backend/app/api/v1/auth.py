"""Authentication endpoints."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import settings
from app.core.security import create_access_token, get_current_active_user
from app.services.user_service import UserService
from app.schemas.auth import Token, LoginRequest, LoginResponse

router = APIRouter()


@router.post("/login", response_model=dict)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    Login endpoint.

    OAuth2 compatible token login.
    """
    user = UserService.authenticate(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status == "0":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is locked",
        )

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    # Update last login time
    UserService.update_last_login(db, user.user_id)

    # Get user roles
    roles = UserService.get_user_roles(db, user.user_id)

    # Calculate expiration time
    expire_time = datetime.utcnow() + access_token_expires

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "token": access_token,
            "expire_time": expire_time.strftime("%Y-%m-%d %H:%M:%S"),
            "roles": roles,
            "permissions": [],
            "user": {
                "user_id": user.user_id,
                "username": user.username,
                "email": user.email,
                "mobile": user.mobile,
                "status": user.status,
                "avatar": user.avatar,
            },
        },
    }


@router.post("/logout")
async def logout(current_user=Depends(get_current_active_user)):
    """Logout endpoint."""
    return {"code": 0, "msg": "success"}


@router.get("/me", response_model=dict)
async def get_current_user_info(
    current_user=Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get current user information."""
    roles = UserService.get_user_roles(db, current_user.user_id)

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "user_id": current_user.user_id,
            "username": current_user.username,
            "email": current_user.email,
            "mobile": current_user.mobile,
            "status": current_user.status,
            "avatar": current_user.avatar,
            "description": current_user.description,
            "roles": roles,
            "last_login_time": (
                current_user.last_login_time.strftime("%Y-%m-%d %H:%M:%S")
                if current_user.last_login_time
                else None
            ),
        },
    }
