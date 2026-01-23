"""Services initialization."""

from app.services.user_service import UserService
from app.services.warehouse_service import WarehouseService
from app.services.stock_service import StockService
from app.services.inbound_service import InboundService
from app.services.request_service import RequestService
from app.services.bulletin_service import BulletinService
from app.services.dashboard_service import DashboardService

__all__ = [
    "UserService",
    "WarehouseService",
    "StockService",
    "InboundService",
    "RequestService",
    "BulletinService",
    "DashboardService",
]
