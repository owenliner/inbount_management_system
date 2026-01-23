"""User schemas."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema."""

    username: str
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    ssex: Optional[str] = "2"
    dept_id: Optional[int] = None
    avatar: Optional[str] = None
    description: Optional[str] = None


class UserCreate(UserBase):
    """User creation schema."""

    password: str
    role_ids: Optional[List[int]] = []


class UserUpdate(BaseModel):
    """User update schema."""

    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    ssex: Optional[str] = None
    status: Optional[str] = None
    dept_id: Optional[int] = None
    avatar: Optional[str] = None
    description: Optional[str] = None
    role_ids: Optional[List[int]] = None


class UserResponse(BaseModel):
    """User response schema."""

    user_id: int
    username: str
    email: Optional[str] = None
    mobile: Optional[str] = None
    status: str
    ssex: Optional[str] = None
    dept_id: Optional[int] = None
    avatar: Optional[str] = None
    description: Optional[str] = None
    create_time: Optional[datetime] = None
    last_login_time: Optional[datetime] = None
    roles: List[str] = []

    class Config:
        from_attributes = True


class UserInDB(UserBase):
    """User schema with password hash."""

    user_id: int
    password: str
    status: str

    class Config:
        from_attributes = True


class ChangePassword(BaseModel):
    """Change password schema."""

    old_password: str
    new_password: str
