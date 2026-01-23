"""Bulletin management endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_active_user
from app.services.bulletin_service import BulletinService
from app.schemas.bulletin import BulletinCreate, BulletinUpdate

router = APIRouter()


@router.get("", response_model=dict)
async def get_bulletins(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    title: Optional[str] = None,
    status: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get paginated list of bulletins."""
    skip = (page - 1) * size
    bulletins, total = BulletinService.get_bulletins(db, skip, size, title, status)

    records = [
        {
            "id": b.id,
            "title": b.title,
            "content": b.content,
            "author": b.author,
            "status": b.status,
            "create_date": (
                b.create_date.strftime("%Y-%m-%d %H:%M:%S") if b.create_date else None
            ),
            "update_date": (
                b.update_date.strftime("%Y-%m-%d %H:%M:%S") if b.update_date else None
            ),
        }
        for b in bulletins
    ]

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


@router.get("/active", response_model=dict)
async def get_active_bulletins(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Get active bulletins for display (public endpoint)."""
    bulletins = BulletinService.get_active_bulletins(db, limit)

    return {
        "code": 0,
        "msg": "success",
        "data": [
            {
                "id": b.id,
                "title": b.title,
                "content": b.content,
                "author": b.author,
                "create_date": (
                    b.create_date.strftime("%Y-%m-%d %H:%M:%S")
                    if b.create_date
                    else None
                ),
            }
            for b in bulletins
        ],
    }


@router.get("/{bulletin_id}", response_model=dict)
async def get_bulletin(
    bulletin_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get bulletin by ID."""
    bulletin = BulletinService.get_bulletin_by_id(db, bulletin_id)
    if not bulletin:
        raise HTTPException(status_code=404, detail="Bulletin not found")

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "id": bulletin.id,
            "title": bulletin.title,
            "content": bulletin.content,
            "author": bulletin.author,
            "status": bulletin.status,
            "create_date": (
                bulletin.create_date.strftime("%Y-%m-%d %H:%M:%S")
                if bulletin.create_date
                else None
            ),
            "update_date": (
                bulletin.update_date.strftime("%Y-%m-%d %H:%M:%S")
                if bulletin.update_date
                else None
            ),
        },
    }


@router.post("", response_model=dict)
async def create_bulletin(
    data: BulletinCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Create a new bulletin."""
    # Set author to current user if not provided
    if not data.author:
        data.author = current_user.username

    bulletin = BulletinService.create_bulletin(db, data)
    return {"code": 0, "msg": "success", "data": {"id": bulletin.id}}


@router.put("/{bulletin_id}", response_model=dict)
async def update_bulletin(
    bulletin_id: int,
    data: BulletinUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Update a bulletin."""
    bulletin = BulletinService.update_bulletin(db, bulletin_id, data)
    if not bulletin:
        raise HTTPException(status_code=404, detail="Bulletin not found")

    return {"code": 0, "msg": "success"}


@router.delete("/{bulletin_id}", response_model=dict)
async def delete_bulletin(
    bulletin_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete a bulletin."""
    if not BulletinService.delete_bulletin(db, bulletin_id):
        raise HTTPException(status_code=404, detail="Bulletin not found")

    return {"code": 0, "msg": "success"}
