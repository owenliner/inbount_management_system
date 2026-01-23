"""Dashboard endpoints for statistics and reporting."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.core.security import get_current_active_user
from app.services.dashboard_service import DashboardService

router = APIRouter()


@router.get("/overview", response_model=dict)
async def get_overview_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get overview statistics for dashboard cards."""
    stats = DashboardService.get_overview_stats(db)
    return {"code": 0, "msg": "success", "data": stats}


@router.get("/inbound-daily", response_model=dict)
async def get_daily_inbound_stats(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get daily inbound statistics."""
    stats = DashboardService.get_daily_inbound_stats(db, days)
    return {"code": 0, "msg": "success", "data": stats}


@router.get("/outbound-daily", response_model=dict)
async def get_daily_outbound_stats(
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get daily outbound statistics."""
    stats = DashboardService.get_daily_outbound_stats(db, days)
    return {"code": 0, "msg": "success", "data": stats}


@router.get("/inbound-by-type", response_model=dict)
async def get_inbound_by_type_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get inbound statistics grouped by consumable type."""
    stats = DashboardService.get_inbound_by_type_stats(db)
    return {"code": 0, "msg": "success", "data": stats}


@router.get("/outbound-by-type", response_model=dict)
async def get_outbound_by_type_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get outbound statistics grouped by consumable type."""
    stats = DashboardService.get_outbound_by_type_stats(db)
    return {"code": 0, "msg": "success", "data": stats}


@router.get("/low-stock", response_model=dict)
async def get_low_stock_items(
    threshold: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get items with stock below threshold."""
    items = DashboardService.get_low_stock_items(db, threshold)
    return {"code": 0, "msg": "success", "data": items}


@router.get("/board", response_model=dict)
async def get_stock_board(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_active_user),
):
    """Get comprehensive stock board data."""
    data = DashboardService.get_stock_board(db)
    return {"code": 0, "msg": "success", "data": data}
