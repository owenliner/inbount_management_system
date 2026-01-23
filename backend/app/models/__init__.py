"""Database models initialization."""

from app.models.user import User, Role, UserRole, Menu, RoleMenu
from app.models.warehouse import Storehouse, ConsumableType, Unit
from app.models.stock import StockInfo, StockPut, StockOut, GoodsBelong
from app.models.request import GoodsRequest, PurchaseRequest
from app.models.bulletin import Bulletin

__all__ = [
    # User models
    "User",
    "Role",
    "UserRole",
    "Menu",
    "RoleMenu",
    # Warehouse models
    "Storehouse",
    "ConsumableType",
    "Unit",
    # Stock models
    "StockInfo",
    "StockPut",
    "StockOut",
    "GoodsBelong",
    # Request models
    "GoodsRequest",
    "PurchaseRequest",
    # Bulletin
    "Bulletin",
]
