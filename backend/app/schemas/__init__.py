"""Pydantic schemas initialization."""

from app.schemas.auth import Token, TokenData, LoginRequest
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserInDB
from app.schemas.warehouse import (
    StorehouseCreate,
    StorehouseUpdate,
    StorehouseResponse,
    ConsumableTypeCreate,
    ConsumableTypeUpdate,
    ConsumableTypeResponse,
    UnitCreate,
    UnitUpdate,
    UnitResponse,
)
from app.schemas.stock import (
    StockInfoCreate,
    StockInfoUpdate,
    StockInfoResponse,
    StockPutCreate,
    StockPutResponse,
    InboundCreate,
    InboundItemCreate,
)
from app.schemas.request import (
    PurchaseRequestCreate,
    PurchaseRequestUpdate,
    PurchaseRequestResponse,
    GoodsRequestCreate,
    GoodsRequestUpdate,
    GoodsRequestResponse,
)
from app.schemas.bulletin import BulletinCreate, BulletinUpdate, BulletinResponse
from app.schemas.common import PaginatedResponse, Response

__all__ = [
    # Auth
    "Token",
    "TokenData",
    "LoginRequest",
    # User
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserInDB",
    # Warehouse
    "StorehouseCreate",
    "StorehouseUpdate",
    "StorehouseResponse",
    "ConsumableTypeCreate",
    "ConsumableTypeUpdate",
    "ConsumableTypeResponse",
    "UnitCreate",
    "UnitUpdate",
    "UnitResponse",
    # Stock
    "StockInfoCreate",
    "StockInfoUpdate",
    "StockInfoResponse",
    "StockPutCreate",
    "StockPutResponse",
    "InboundCreate",
    "InboundItemCreate",
    # Request
    "PurchaseRequestCreate",
    "PurchaseRequestUpdate",
    "PurchaseRequestResponse",
    "GoodsRequestCreate",
    "GoodsRequestUpdate",
    "GoodsRequestResponse",
    # Bulletin
    "BulletinCreate",
    "BulletinUpdate",
    "BulletinResponse",
    # Common
    "PaginatedResponse",
    "Response",
]
