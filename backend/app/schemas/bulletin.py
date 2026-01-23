"""Bulletin schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class BulletinBase(BaseModel):
    """Base bulletin schema."""

    title: str
    content: Optional[str] = None
    author: Optional[str] = None


class BulletinCreate(BulletinBase):
    """Bulletin creation schema."""

    pass


class BulletinUpdate(BaseModel):
    """Bulletin update schema."""

    title: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    status: Optional[int] = None


class BulletinResponse(BulletinBase):
    """Bulletin response schema."""

    id: int
    status: int
    create_date: Optional[datetime] = None
    update_date: Optional[datetime] = None

    class Config:
        from_attributes = True
