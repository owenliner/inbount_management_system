"""User management endpoints."""

from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_active_user
from app.services.user_service import UserService
from app.schemas.user import UserCreate, UserUpdate, UserResponse

router = APIRouter()


@router.get("", response_model=dict)
async def get_users(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    username: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get paginated list of users."""
    skip = (page - 1) * size
    users, total = UserService.get_users(db, skip, size, username, status)

    records = []
    for user in users:
        roles = UserService.get_user_roles(db, user.user_id)
        records.append({
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "mobile": user.mobile,
            "status": user.status,
            "ssex": user.ssex,
            "avatar": user.avatar,
            "create_time": (
                user.create_time.strftime("%Y-%m-%d %H:%M:%S")
                if user.create_time
                else None
            ),
            "roles": roles,
        })

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "records": records,
            "total": total,
            "size": size,
            "current": page,
            "pages": (total + size - 1) // size,
        },
    }


@router.get("/{user_id}", response_model=dict)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get user by ID."""
    user = UserService.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    roles = UserService.get_user_roles(db, user.user_id)

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "user_id": user.user_id,
            "username": user.username,
            "email": user.email,
            "mobile": user.mobile,
            "status": user.status,
            "ssex": user.ssex,
            "avatar": user.avatar,
            "description": user.description,
            "create_time": (
                user.create_time.strftime("%Y-%m-%d %H:%M:%S")
                if user.create_time
                else None
            ),
            "roles": roles,
        },
    }


@router.post("", response_model=dict)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Create a new user."""
    # Check if username already exists
    existing_user = UserService.get_by_username(db, user_data.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    user = UserService.create(db, user_data)
    return {"code": 0, "msg": "success", "data": {"user_id": user.user_id}}


@router.put("/{user_id}", response_model=dict)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Update a user."""
    user = UserService.update(db, user_id, user_data)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {"code": 0, "msg": "success"}


@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete a user."""
    if not UserService.delete(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")

    return {"code": 0, "msg": "success"}
