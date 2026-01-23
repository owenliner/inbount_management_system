"""Dashboard service for statistics and reporting."""

from datetime import datetime, timedelta
from typing import List, Dict, Any
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from app.models.stock import StockInfo, StockPut, StockOut
from app.models.warehouse import ConsumableType


class DashboardService:
    """Service class for dashboard operations."""

    @staticmethod
    def get_overview_stats(db: Session) -> Dict[str, Any]:
        """Get overview statistics for dashboard cards."""
        # Total inbound count
        inbound_count = db.query(func.count(StockPut.id)).scalar() or 0

        # This month's inbound count
        today = datetime.utcnow()
        first_day_of_month = today.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_inbound_count = (
            db.query(func.count(StockPut.id))
            .filter(StockPut.create_date >= first_day_of_month)
            .scalar()
            or 0
        )

        # Total consumption value
        total_consumption = (
            db.query(func.sum(StockInfo.price * StockInfo.amount))
            .filter(StockInfo.is_in == 2)
            .scalar()
            or Decimal("0")
        )

        return {
            "inbound_count": inbound_count,
            "month_inbound_count": month_inbound_count,
            "total_consumption": float(total_consumption),
        }

    @staticmethod
    def get_daily_inbound_stats(db: Session, days: int = 7) -> List[Dict[str, Any]]:
        """Get daily inbound statistics for the last N days."""
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        start_date = today - timedelta(days=days - 1)

        # Query daily inbound counts
        results = (
            db.query(
                func.date(StockInfo.create_date).label("date"),
                func.sum(StockInfo.amount).label("amount"),
            )
            .filter(
                StockInfo.is_in == 1,
                StockInfo.create_date >= start_date,
            )
            .group_by(func.date(StockInfo.create_date))
            .all()
        )

        # Create a dict for easy lookup
        data_dict = {str(r.date): r.amount for r in results}

        # Generate complete list with all days
        stats = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            short_date = date.strftime("%m-%d")
            stats.append({
                "date": short_date,
                "amount": data_dict.get(date_str, 0) or 0,
            })

        return stats

    @staticmethod
    def get_daily_outbound_stats(db: Session, days: int = 7) -> List[Dict[str, Any]]:
        """Get daily outbound statistics for the last N days."""
        today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        start_date = today - timedelta(days=days - 1)

        results = (
            db.query(
                func.date(StockInfo.create_date).label("date"),
                func.sum(StockInfo.amount).label("amount"),
            )
            .filter(
                StockInfo.is_in == 2,
                StockInfo.create_date >= start_date,
            )
            .group_by(func.date(StockInfo.create_date))
            .all()
        )

        data_dict = {str(r.date): r.amount for r in results}

        stats = []
        for i in range(days):
            date = start_date + timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            short_date = date.strftime("%m-%d")
            stats.append({
                "date": short_date,
                "amount": data_dict.get(date_str, 0) or 0,
            })

        return stats

    @staticmethod
    def get_inbound_by_type_stats(db: Session) -> List[Dict[str, Any]]:
        """Get inbound statistics grouped by consumable type."""
        results = (
            db.query(
                ConsumableType.name,
                func.sum(StockInfo.amount).label("amount"),
            )
            .join(ConsumableType, StockInfo.type_id == ConsumableType.id)
            .filter(StockInfo.is_in == 1)
            .group_by(ConsumableType.name)
            .all()
        )

        return [{"name": r.name, "value": r.amount or 0} for r in results]

    @staticmethod
    def get_outbound_by_type_stats(db: Session) -> List[Dict[str, Any]]:
        """Get outbound statistics grouped by consumable type."""
        results = (
            db.query(
                ConsumableType.name,
                func.sum(StockInfo.amount).label("amount"),
            )
            .join(ConsumableType, StockInfo.type_id == ConsumableType.id)
            .filter(StockInfo.is_in == 2)
            .group_by(ConsumableType.name)
            .all()
        )

        return [{"name": r.name, "value": r.amount or 0} for r in results]

    @staticmethod
    def get_low_stock_items(db: Session, threshold: int = 10) -> List[Dict[str, Any]]:
        """Get items with stock below threshold."""
        results = (
            db.query(StockInfo)
            .filter(
                StockInfo.is_in == 0,
                StockInfo.amount <= threshold,
                StockInfo.amount > 0,
            )
            .order_by(StockInfo.amount)
            .limit(20)
            .all()
        )

        return [
            {
                "id": r.id,
                "name": r.name,
                "type": r.type,
                "amount": r.amount,
                "unit": r.unit,
            }
            for r in results
        ]

    @staticmethod
    def get_stock_board(db: Session) -> Dict[str, Any]:
        """Get comprehensive stock board data."""
        return {
            "overview": DashboardService.get_overview_stats(db),
            "daily_inbound": DashboardService.get_daily_inbound_stats(db),
            "daily_outbound": DashboardService.get_daily_outbound_stats(db),
            "inbound_by_type": DashboardService.get_inbound_by_type_stats(db),
            "outbound_by_type": DashboardService.get_outbound_by_type_stats(db),
            "low_stock": DashboardService.get_low_stock_items(db),
        }
