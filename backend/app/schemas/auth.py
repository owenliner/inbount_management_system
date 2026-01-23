"""Authentication schemas."""

from typing import Optional, List
from pydantic import BaseModel


class Token(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """JWT token payload data."""

    username: Optional[str] = None


class LoginRequest(BaseModel):
    """Login request payload."""

    username: str
    password: str


class LoginResponse(BaseModel):
    """Login response with user info."""

    token: str
    expire_time: str
    roles: List[str]
    permissions: List[str]
    user: dict
