"""Request schemas for purchase and goods requests."""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel


# Purchase Request Item schemas
class PurchaseRequestItemBase(BaseModel):
    """Base purchase request item schema."""

    name: str
    type: Optional[str] = None
    type_id: Optional[int] = None
    amount: int = 0
    unit: Optional[str] = None
    price: Decimal = Decimal("0.00")


class PurchaseRequestItemCreate(PurchaseRequestItemBase):
    """Purchase request item creation schema."""

    pass


class PurchaseRequestItemResponse(PurchaseRequestItemBase):
    """Purchase request item response schema."""

    id: int

    class Config:
        from_attributes = True


# Purchase Request schemas
class PurchaseRequestBase(BaseModel):
    """Base purchase request schema."""

    content: Optional[str] = None


class PurchaseRequestCreate(PurchaseRequestBase):
    """Purchase request creation schema."""

    items: List[PurchaseRequestItemCreate]


class PurchaseRequestUpdate(BaseModel):
    """Purchase request update schema."""

    content: Optional[str] = None
    status: Optional[int] = None


class PurchaseRequestResponse(PurchaseRequestBase):
    """Purchase request response schema."""

    id: int
    num: str
    user_id: Optional[int] = None
    username: Optional[str] = None
    status: int
    total_price: Decimal
    create_date: Optional[datetime] = None
    approve_date: Optional[datetime] = None
    items: List[PurchaseRequestItemResponse] = []

    class Config:
        from_attributes = True


# Goods Request Item schemas
class GoodsRequestItemBase(BaseModel):
    """Base goods request item schema."""

    stock_info_id: Optional[int] = None
    name: str
    type: Optional[str] = None
    type_id: Optional[int] = None
    amount: int = 0
    stock_amount: int = 0
    unit: Optional[str] = None
    price: Decimal = Decimal("0.00")


class GoodsRequestItemCreate(GoodsRequestItemBase):
    """Goods request item creation schema."""

    pass


class GoodsRequestItemResponse(GoodsRequestItemBase):
    """Goods request item response schema."""

    id: int

    class Config:
        from_attributes = True


# Goods Request schemas
class GoodsRequestBase(BaseModel):
    """Base goods request schema."""

    purchase_num: Optional[str] = None
    content: Optional[str] = None


class GoodsRequestCreate(GoodsRequestBase):
    """Goods request creation schema."""

    items: List[GoodsRequestItemCreate]


class GoodsRequestUpdate(BaseModel):
    """Goods request update schema."""

    content: Optional[str] = None
    status: Optional[int] = None


class GoodsRequestResponse(GoodsRequestBase):
    """Goods request response schema."""

    id: int
    num: str
    user_id: Optional[int] = None
    username: Optional[str] = None
    status: int
    status_text: str
    create_date: Optional[datetime] = None
    approve_date: Optional[datetime] = None
    items: List[GoodsRequestItemResponse] = []

    class Config:
        from_attributes = True
