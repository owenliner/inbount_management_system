"""Warehouse management endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_active_user
from app.services.warehouse_service import WarehouseService
from app.schemas.warehouse import StorehouseCreate, StorehouseUpdate

router = APIRouter()


@router.get("", response_model=dict)
async def get_warehouses(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get paginated list of warehouses."""
    skip = (page - 1) * size
    warehouses, total = WarehouseService.get_storehouses(db, skip, size, name)

    records = [
        {
            "id": w.id,
            "code": w.code,
            "name": w.name,
            "principal": w.principal,
            "contact": w.contact,
            "address": w.address,
            "content": w.content,
            "create_date": (
                w.create_date.strftime("%Y-%m-%d %H:%M:%S") if w.create_date else None
            ),
        }
        for w in warehouses
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
async def get_warehouse_list(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get all warehouses (for dropdowns)."""
    warehouses = WarehouseService.get_all_storehouses(db)

    return {
        "code": 0,
        "msg": "success",
        "data": [
            {"id": w.id, "code": w.code, "name": w.name}
            for w in warehouses
        ],
    }


@router.get("/{warehouse_id}", response_model=dict)
async def get_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get warehouse by ID."""
    warehouse = WarehouseService.get_storehouse_by_id(db, warehouse_id)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "id": warehouse.id,
            "code": warehouse.code,
            "name": warehouse.name,
            "principal": warehouse.principal,
            "contact": warehouse.contact,
            "address": warehouse.address,
            "content": warehouse.content,
            "create_date": (
                warehouse.create_date.strftime("%Y-%m-%d %H:%M:%S")
                if warehouse.create_date
                else None
            ),
        },
    }


@router.post("", response_model=dict)
async def create_warehouse(
    data: StorehouseCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Create a new warehouse."""
    warehouse = WarehouseService.create_storehouse(db, data)
    return {"code": 0, "msg": "success", "data": {"id": warehouse.id}}


@router.put("/{warehouse_id}", response_model=dict)
async def update_warehouse(
    warehouse_id: int,
    data: StorehouseUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Update a warehouse."""
    warehouse = WarehouseService.update_storehouse(db, warehouse_id, data)
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")

    return {"code": 0, "msg": "success"}


@router.delete("/{warehouse_id}", response_model=dict)
async def delete_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete a warehouse."""
    if not WarehouseService.delete_storehouse(db, warehouse_id):
        raise HTTPException(status_code=404, detail="Warehouse not found")

    return {"code": 0, "msg": "success"}
