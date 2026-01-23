"""API v1 package initialization."""

from fastapi import APIRouter

from app.api.v1 import (
    auth,
    users,
    warehouses,
    stock,
    inbound,
    goods_types,
    units,
    purchase,
    goods_request,
    bulletins,
    dashboard,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(warehouses.router, prefix="/warehouses", tags=["Warehouses"])
api_router.include_router(stock.router, prefix="/stock", tags=["Stock"])
api_router.include_router(inbound.router, prefix="/inbound", tags=["Inbound"])
api_router.include_router(goods_types.router, prefix="/consumable-types", tags=["Consumable Types"])
api_router.include_router(units.router, prefix="/units", tags=["Units"])
api_router.include_router(purchase.router, prefix="/purchase-requests", tags=["Purchase Requests"])
api_router.include_router(goods_request.router, prefix="/goods-requests", tags=["Goods Requests"])
api_router.include_router(bulletins.router, prefix="/bulletins", tags=["Bulletins"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
