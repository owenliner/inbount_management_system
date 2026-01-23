"""Unit management endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_active_user
from app.services.warehouse_service import WarehouseService
from app.schemas.warehouse import UnitCreate, UnitUpdate

router = APIRouter()


@router.get("", response_model=dict)
async def get_units(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get paginated list of units."""
    skip = (page - 1) * size
    units, total = WarehouseService.get_units(db, skip, size, name)

    records = [
        {
            "id": u.id,
            "name": u.name,
            "remark": u.remark,
            "create_date": (
                u.create_date.strftime("%Y-%m-%d %H:%M:%S") if u.create_date else None
            ),
        }
        for u in units
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
async def get_unit_list(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get all units (for dropdowns)."""
    units = WarehouseService.get_all_units(db)

    return {
        "code": 0,
        "msg": "success",
        "data": [{"id": u.id, "name": u.name} for u in units],
    }


@router.get("/{unit_id}", response_model=dict)
async def get_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get unit by ID."""
    unit = WarehouseService.get_unit_by_id(db, unit_id)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "id": unit.id,
            "name": unit.name,
            "remark": unit.remark,
            "create_date": (
                unit.create_date.strftime("%Y-%m-%d %H:%M:%S")
                if unit.create_date
                else None
            ),
        },
    }


@router.post("", response_model=dict)
async def create_unit(
    data: UnitCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Create a new unit."""
    unit = WarehouseService.create_unit(db, data)
    return {"code": 0, "msg": "success", "data": {"id": unit.id}}


@router.put("/{unit_id}", response_model=dict)
async def update_unit(
    unit_id: int,
    data: UnitUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Update a unit."""
    unit = WarehouseService.update_unit(db, unit_id, data)
    if not unit:
        raise HTTPException(status_code=404, detail="Unit not found")

    return {"code": 0, "msg": "success"}


@router.delete("/{unit_id}", response_model=dict)
async def delete_unit(
    unit_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete a unit."""
    if not WarehouseService.delete_unit(db, unit_id):
        raise HTTPException(status_code=404, detail="Unit not found")

    return {"code": 0, "msg": "success"}
