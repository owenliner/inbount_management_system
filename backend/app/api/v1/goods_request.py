"""Goods request management endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_active_user
from app.services.request_service import RequestService
from app.schemas.request import GoodsRequestCreate, GoodsRequestUpdate

router = APIRouter()


@router.get("", response_model=dict)
async def get_goods_requests(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    num: Optional[str] = None,
    status: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get paginated list of goods requests."""
    skip = (page - 1) * size
    requests, total = RequestService.get_goods_requests(db, skip, size, num, status)

    records = []
    for req in requests:
        records.append({
            "id": req["id"],
            "num": req["num"],
            "purchase_num": req["purchase_num"],
            "user_id": req["user_id"],
            "username": req["username"],
            "content": req["content"],
            "status": req["status"],
            "status_text": req["status_text"],
            "create_date": (
                req["create_date"].strftime("%Y-%m-%d %H:%M:%S")
                if req["create_date"]
                else None
            ),
            "approve_date": (
                req["approve_date"].strftime("%Y-%m-%d %H:%M:%S")
                if req["approve_date"]
                else None
            ),
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


@router.get("/{request_id}", response_model=dict)
async def get_goods_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get goods request by ID with items."""
    request = RequestService.get_goods_request_by_id(db, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Goods request not found")

    items = []
    for item in request["items"]:
        items.append({
            "id": item.id,
            "stock_info_id": item.stock_info_id,
            "name": item.name,
            "type": item.type,
            "type_id": item.type_id,
            "amount": item.amount,
            "stock_amount": item.stock_amount,
            "unit": item.unit,
            "price": float(item.price) if item.price else 0,
        })

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "id": request["id"],
            "num": request["num"],
            "purchase_num": request["purchase_num"],
            "user_id": request["user_id"],
            "username": request["username"],
            "content": request["content"],
            "status": request["status"],
            "status_text": request["status_text"],
            "create_date": (
                request["create_date"].strftime("%Y-%m-%d %H:%M:%S")
                if request["create_date"]
                else None
            ),
            "approve_date": (
                request["approve_date"].strftime("%Y-%m-%d %H:%M:%S")
                if request["approve_date"]
                else None
            ),
            "items": items,
        },
    }


@router.post("", response_model=dict)
async def create_goods_request(
    data: GoodsRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Create a new goods request."""
    if not data.items:
        raise HTTPException(status_code=400, detail="At least one item is required")

    request = RequestService.create_goods_request(db, current_user.user_id, data)
    return {
        "code": 0,
        "msg": "success",
        "data": {"id": request.id, "num": request.num},
    }


@router.post("/{request_id}/approve", response_model=dict)
async def approve_goods_request(
    request_id: int,
    approved: bool = True,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Approve or reject a goods request."""
    request = RequestService.approve_goods_request(
        db, request_id, current_user.user_id, approved
    )
    if not request:
        raise HTTPException(status_code=404, detail="Goods request not found")

    return {"code": 0, "msg": "success"}


@router.delete("/{request_id}", response_model=dict)
async def delete_goods_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete a goods request."""
    if not RequestService.delete_goods_request(db, request_id):
        raise HTTPException(status_code=404, detail="Goods request not found")

    return {"code": 0, "msg": "success"}
