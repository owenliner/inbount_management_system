"""Consumable type management endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_active_user
from app.services.warehouse_service import WarehouseService
from app.schemas.warehouse import ConsumableTypeCreate, ConsumableTypeUpdate

router = APIRouter()


@router.get("", response_model=dict)
async def get_consumable_types(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get paginated list of consumable types."""
    skip = (page - 1) * size
    types, total = WarehouseService.get_consumable_types(db, skip, size, name)

    records = [
        {
            "id": t.id,
            "name": t.name,
            "code": t.code,
            "remark": t.remark,
            "create_date": (
                t.create_date.strftime("%Y-%m-%d %H:%M:%S") if t.create_date else None
            ),
        }
        for t in types
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


@router.get("/list", response_model=dict)
async def get_consumable_type_list(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get all consumable types (for dropdowns)."""
    types = WarehouseService.get_all_consumable_types(db)

    return {
        "code": 0,
        "msg": "success",
        "data": [{"id": t.id, "name": t.name, "code": t.code} for t in types],
    }


@router.get("/{type_id}", response_model=dict)
async def get_consumable_type(
    type_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get consumable type by ID."""
    ctype = WarehouseService.get_consumable_type_by_id(db, type_id)
    if not ctype:
        raise HTTPException(status_code=404, detail="Consumable type not found")

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "id": ctype.id,
            "name": ctype.name,
            "code": ctype.code,
            "remark": ctype.remark,
            "create_date": (
                ctype.create_date.strftime("%Y-%m-%d %H:%M:%S")
                if ctype.create_date
                else None
            ),
        },
    }


@router.post("", response_model=dict)
async def create_consumable_type(
    data: ConsumableTypeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Create a new consumable type."""
    ctype = WarehouseService.create_consumable_type(db, data)
    return {"code": 0, "msg": "success", "data": {"id": ctype.id}}


@router.put("/{type_id}", response_model=dict)
async def update_consumable_type(
    type_id: int,
    data: ConsumableTypeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Update a consumable type."""
    ctype = WarehouseService.update_consumable_type(db, type_id, data)
    if not ctype:
        raise HTTPException(status_code=404, detail="Consumable type not found")

    return {"code": 0, "msg": "success"}


@router.delete("/{type_id}", response_model=dict)
async def delete_consumable_type(
    type_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete a consumable type."""
    if not WarehouseService.delete_consumable_type(db, type_id):
        raise HTTPException(status_code=404, detail="Consumable type not found")

    return {"code": 0, "msg": "success"}
