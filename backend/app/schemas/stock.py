"""Stock schemas."""

from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel


# StockInfo schemas
class StockInfoBase(BaseModel):
    """Base stock info schema."""

    name: str
    type_id: Optional[int] = None
    type: Optional[str] = None
    amount: int = 0
    unit: Optional[str] = None
    content: Optional[str] = None
    price: Decimal = Decimal("0.00")
    stock_id: Optional[int] = None


class StockInfoCreate(StockInfoBase):
    """Stock info creation schema."""

    is_in: int = 0


class StockInfoUpdate(BaseModel):
    """Stock info update schema."""

    name: Optional[str] = None
    type_id: Optional[int] = None
    type: Optional[str] = None
    amount: Optional[int] = None
    unit: Optional[str] = None
    content: Optional[str] = None
    price: Optional[Decimal] = None
    stock_id: Optional[int] = None
    is_in: Optional[int] = None


class StockInfoResponse(StockInfoBase):
    """Stock info response schema."""

    id: int
    is_in: int
    to_user_id: Optional[int] = None
    parent_id: Optional[int] = None
    create_date: Optional[datetime] = None
    type_name: Optional[str] = None
    storehouse_name: Optional[str] = None

    class Config:
        from_attributes = True


# StockPut schemas
class StockPutBase(BaseModel):
    """Base stock put (inbound) schema."""

    custodian: Optional[str] = None
    put_user: Optional[str] = None
    content: Optional[str] = None


class StockPutCreate(StockPutBase):
    """Stock put creation schema."""

    pass


class StockPutResponse(StockPutBase):
    """Stock put response schema."""

    id: int
    num: str
    price: Decimal
    create_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# Inbound schemas (for creating inbound transactions)
class InboundItemCreate(BaseModel):
    """Individual item in an inbound transaction."""

    name: str
    type: Optional[str] = None
    type_id: Optional[int] = None
    amount: int
    unit: Optional[str] = None
    price: Decimal = Decimal("0.00")


class InboundCreate(BaseModel):
    """Inbound transaction creation schema."""

    stock_id: int  # Warehouse ID
    custodian: str
    put_user: str
    content: Optional[str] = None
    items: List[InboundItemCreate]


class InboundResponse(BaseModel):
    """Inbound transaction response."""

    id: int
    num: str
    price: Decimal
    custodian: Optional[str] = None
    put_user: Optional[str] = None
    content: Optional[str] = None
    create_date: Optional[datetime] = None
    items: List[StockInfoResponse] = []

    class Config:
        from_attributes = True


# Stock detail (for inbound/outbound history)
class StockDetailResponse(BaseModel):
    """Stock detail response for history views."""

    id: int
    name: str
    type: Optional[str] = None
    type_name: Optional[str] = None
    amount: int
    unit: Optional[str] = None
    price: Decimal
    is_in: int
    status_text: str
    create_date: Optional[datetime] = None
    storehouse_name: Optional[str] = None

    class Config:
        from_attributes = True
