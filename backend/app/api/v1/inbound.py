"""Inbound management endpoints."""

from typing import Optional, List
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
import openpyxl
from io import BytesIO

from app.database import get_db
from app.core.security import get_current_active_user
from app.services.inbound_service import InboundService
from app.schemas.stock import InboundCreate

router = APIRouter()


@router.get("", response_model=dict)
async def get_inbounds(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    num: Optional[str] = None,
    custodian: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get paginated list of inbound transactions."""
    skip = (page - 1) * size
    inbounds, total = InboundService.get_inbounds(db, skip, size, num, custodian)

    records = [
        {
            "id": i.id,
            "num": i.num,
            "price": float(i.price) if i.price else 0,
            "custodian": i.custodian,
            "put_user": i.put_user,
            "content": i.content,
            "create_date": (
                i.create_date.strftime("%Y-%m-%d %H:%M:%S") if i.create_date else None
            ),
        }
        for i in inbounds
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


@router.get("/{inbound_id}", response_model=dict)
async def get_inbound(
    inbound_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get inbound transaction by ID with items."""
    inbound = InboundService.get_inbound_by_id(db, inbound_id)
    if not inbound:
        raise HTTPException(status_code=404, detail="Inbound not found")

    items = []
    for item in inbound["items"]:
        items.append({
            "id": item.id,
            "name": item.name,
            "type": item.type,
            "type_id": item.type_id,
            "amount": item.amount,
            "unit": item.unit,
            "price": float(item.price) if item.price else 0,
        })

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "id": inbound["id"],
            "num": inbound["num"],
            "price": float(inbound["price"]) if inbound["price"] else 0,
            "custodian": inbound["custodian"],
            "put_user": inbound["put_user"],
            "content": inbound["content"],
            "create_date": (
                inbound["create_date"].strftime("%Y-%m-%d %H:%M:%S")
                if inbound["create_date"]
                else None
            ),
            "items": items,
        },
    }


@router.post("", response_model=dict)
async def create_inbound(
    data: InboundCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Create a new inbound transaction."""
    if not data.items:
        raise HTTPException(status_code=400, detail="At least one item is required")

    inbound = InboundService.create_inbound(db, data)
    return {
        "code": 0,
        "msg": "success",
        "data": {"id": inbound.id, "num": inbound.num},
    }


@router.post("/import", response_model=dict)
async def import_inbound(
    file: UploadFile = File(...),
    stock_id: int = Form(...),
    custodian: str = Form(...),
    put_user: str = Form(...),
    content: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """
    Import inbound items from Excel file.

    Excel format should have columns: name, type, type_id, amount, unit, price
    """
    # Read Excel file
    contents = await file.read()
    workbook = openpyxl.load_workbook(BytesIO(contents))
    sheet = workbook.active

    # Parse rows (skip header)
    items = []
    for row in sheet.iter_rows(min_row=2, values_only=True):
        if not row[0]:  # Skip empty rows
            continue
        items.append({
            "name": str(row[0]) if row[0] else "",
            "type": str(row[1]) if row[1] else None,
            "type_id": int(row[2]) if row[2] else None,
            "amount": int(row[3]) if row[3] else 0,
            "unit": str(row[4]) if row[4] else None,
            "price": float(row[5]) if row[5] else 0,
        })

    if not items:
        raise HTTPException(status_code=400, detail="No valid items found in Excel file")

    inbound = InboundService.import_from_excel(
        db, stock_id, custodian, put_user, items, content
    )

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "id": inbound.id,
            "num": inbound.num,
            "items_count": len(items),
        },
    }


@router.get("/template/download", response_model=dict)
async def get_import_template():
    """Get the import template information."""
    return {
        "code": 0,
        "msg": "success",
        "data": {
            "columns": [
                {"name": "name", "description": "物品名称", "required": True},
                {"name": "type", "description": "型号/规格", "required": False},
                {"name": "type_id", "description": "分类ID", "required": False},
                {"name": "amount", "description": "数量", "required": True},
                {"name": "unit", "description": "单位", "required": False},
                {"name": "price", "description": "单价", "required": False},
            ],
        },
    }


@router.delete("/{inbound_id}", response_model=dict)
async def delete_inbound(
    inbound_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete an inbound transaction."""
    if not InboundService.delete_inbound(db, inbound_id):
        raise HTTPException(status_code=404, detail="Inbound not found")

    return {"code": 0, "msg": "success"}
