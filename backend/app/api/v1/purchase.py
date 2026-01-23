"""Purchase request management endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_active_user
from app.services.request_service import RequestService
from app.schemas.request import PurchaseRequestCreate, PurchaseRequestUpdate

router = APIRouter()


@router.get("", response_model=dict)
async def get_purchase_requests(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    num: Optional[str] = None,
    status: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get paginated list of purchase requests."""
    skip = (page - 1) * size
    requests, total = RequestService.get_purchase_requests(
        db, skip, size, num, status
    )

    records = []
    for req in requests:
        records.append({
            "id": req["id"],
            "num": req["num"],
            "user_id": req["user_id"],
            "username": req["username"],
            "content": req["content"],
            "status": req["status"],
            "total_price": float(req["total_price"]) if req["total_price"] else 0,
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
async def get_purchase_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get purchase request by ID with items."""
    request = RequestService.get_purchase_request_by_id(db, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Purchase request not found")

    items = []
    for item in request["items"]:
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
            "id": request["id"],
            "num": request["num"],
            "user_id": request["user_id"],
            "username": request["username"],
            "content": request["content"],
            "status": request["status"],
            "total_price": float(request["total_price"]) if request["total_price"] else 0,
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
async def create_purchase_request(
    data: PurchaseRequestCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Create a new purchase request."""
    if not data.items:
        raise HTTPException(status_code=400, detail="At least one item is required")

    request = RequestService.create_purchase_request(db, current_user.user_id, data)
    return {
        "code": 0,
        "msg": "success",
        "data": {"id": request.id, "num": request.num},
    }


@router.put("/{request_id}", response_model=dict)
async def update_purchase_request(
    request_id: int,
    data: PurchaseRequestUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Update a purchase request."""
    request = RequestService.update_purchase_request(db, request_id, data)
    if not request:
        raise HTTPException(status_code=404, detail="Purchase request not found")

    return {"code": 0, "msg": "success"}


@router.post("/{request_id}/approve", response_model=dict)
async def approve_purchase_request(
    request_id: int,
    approved: bool = True,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Approve or reject a purchase request."""
    request = RequestService.approve_purchase_request(
        db, request_id, current_user.user_id, approved
    )
    if not request:
        raise HTTPException(status_code=404, detail="Purchase request not found")

    return {"code": 0, "msg": "success"}


@router.delete("/{request_id}", response_model=dict)
async def delete_purchase_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete a purchase request."""
    if not RequestService.delete_purchase_request(db, request_id):
        raise HTTPException(status_code=404, detail="Purchase request not found")

    return {"code": 0, "msg": "success"}
