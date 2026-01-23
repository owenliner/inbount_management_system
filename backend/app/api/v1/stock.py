"""Stock management endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_active_user
from app.services.stock_service import StockService

router = APIRouter()


@router.get("", response_model=dict)
async def get_stocks(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    name: Optional[str] = None,
    type_id: Optional[int] = None,
    stock_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get paginated list of warehouse stocks (is_in=0)."""
    skip = (page - 1) * size
    stocks, total = StockService.get_stocks(
        db, skip, size, name, type_id, stock_id, is_in=0
    )

    records = []
    for stock in stocks:
        records.append({
            "id": stock["id"],
            "name": stock["name"],
            "type": stock["type"],
            "type_id": stock["type_id"],
            "type_name": stock["type_name"],
            "amount": stock["amount"],
            "unit": stock["unit"],
            "price": float(stock["price"]) if stock["price"] else 0,
            "stock_id": stock["stock_id"],
            "storehouse_name": stock["storehouse_name"],
            "create_date": (
                stock["create_date"].strftime("%Y-%m-%d %H:%M:%S")
                if stock["create_date"]
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


@router.get("/detail", response_model=dict)
async def get_stock_detail(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    name: Optional[str] = None,
    type_id: Optional[int] = None,
    is_in: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get paginated inbound/outbound detail history."""
    skip = (page - 1) * size
    stocks, total = StockService.get_stock_detail(db, skip, size, name, type_id, is_in)

    records = []
    for stock in stocks:
        records.append({
            "id": stock["id"],
            "name": stock["name"],
            "type": stock["type"],
            "type_id": stock["type_id"],
            "type_name": stock["type_name"],
            "amount": stock["amount"],
            "unit": stock["unit"],
            "price": float(stock["price"]) if stock["price"] else 0,
            "is_in": stock["is_in"],
            "status_text": stock["status_text"],
            "storehouse_name": stock["storehouse_name"],
            "create_date": (
                stock["create_date"].strftime("%Y-%m-%d %H:%M:%S")
                if stock["create_date"]
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


@router.get("/summary", response_model=dict)
async def get_stock_summary(
    stock_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get aggregated stock summary."""
    summary = StockService.get_stock_summary(db, stock_id)
    return {"code": 0, "msg": "success", "data": summary}


@router.get("/{stock_id}", response_model=dict)
async def get_stock(
    stock_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get stock by ID."""
    stock = StockService.get_stock_by_id(db, stock_id)
    if not stock:
        raise HTTPException(status_code=404, detail="Stock not found")

    return {
        "code": 0,
        "msg": "success",
        "data": {
            "id": stock.id,
            "name": stock.name,
            "type": stock.type,
            "type_id": stock.type_id,
            "amount": stock.amount,
            "unit": stock.unit,
            "content": stock.content,
            "price": float(stock.price) if stock.price else 0,
            "is_in": stock.is_in,
            "stock_id": stock.stock_id,
            "create_date": (
                stock.create_date.strftime("%Y-%m-%d %H:%M:%S")
                if stock.create_date
                else None
            ),
        },
    }


@router.delete("/{stock_id}", response_model=dict)
async def delete_stock(
    stock_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Delete a stock record."""
    if not StockService.delete_stock(db, stock_id):
        raise HTTPException(status_code=404, detail="Stock not found")

    return {"code": 0, "msg": "success"}
