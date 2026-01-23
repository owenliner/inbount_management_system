"""Warehouse schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# Storehouse schemas
class StorehouseBase(BaseModel):
    """Base storehouse schema."""

    name: str
    principal: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    content: Optional[str] = None


class StorehouseCreate(StorehouseBase):
    """Storehouse creation schema."""

    pass


class StorehouseUpdate(BaseModel):
    """Storehouse update schema."""

    name: Optional[str] = None
    principal: Optional[str] = None
    contact: Optional[str] = None
    address: Optional[str] = None
    content: Optional[str] = None


class StorehouseResponse(StorehouseBase):
    """Storehouse response schema."""

    id: int
    code: str
    create_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# ConsumableType schemas
class ConsumableTypeBase(BaseModel):
    """Base consumable type schema."""

    name: str
    code: Optional[str] = None
    remark: Optional[str] = None


class ConsumableTypeCreate(ConsumableTypeBase):
    """Consumable type creation schema."""

    pass


class ConsumableTypeUpdate(BaseModel):
    """Consumable type update schema."""

    name: Optional[str] = None
    code: Optional[str] = None
    remark: Optional[str] = None


class ConsumableTypeResponse(ConsumableTypeBase):
    """Consumable type response schema."""

    id: int
    create_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# Unit schemas
class UnitBase(BaseModel):
    """Base unit schema."""

    name: str
    remark: Optional[str] = None


class UnitCreate(UnitBase):
    """Unit creation schema."""

    pass


class UnitUpdate(BaseModel):
    """Unit update schema."""

    name: Optional[str] = None
    remark: Optional[str] = None


class UnitResponse(UnitBase):
    """Unit response schema."""

    id: int
    create_date: Optional[datetime] = None

    class Config:
        from_attributes = True
