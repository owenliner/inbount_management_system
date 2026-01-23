"""Warehouse service for storehouse, type, and unit management."""

from datetime import datetime
from typing import Optional, List
import time

from sqlalchemy.orm import Session

from app.models.warehouse import Storehouse, ConsumableType, Unit
from app.schemas.warehouse import (
    StorehouseCreate,
    StorehouseUpdate,
    ConsumableTypeCreate,
    ConsumableTypeUpdate,
    UnitCreate,
    UnitUpdate,
)


class WarehouseService:
    """Service class for warehouse operations."""

    # Storehouse operations
    @staticmethod
    def get_storehouse_by_id(db: Session, storehouse_id: int) -> Optional[Storehouse]:
        """Get storehouse by ID."""
        return db.query(Storehouse).filter(Storehouse.id == storehouse_id).first()

    @staticmethod
    def get_storehouses(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        name: Optional[str] = None,
    ) -> tuple[List[Storehouse], int]:
        """Get paginated list of storehouses."""
        query = db.query(Storehouse)

        if name:
            query = query.filter(Storehouse.name.ilike(f"%{name}%"))

        total = query.count()
        storehouses = query.order_by(Storehouse.create_date.desc()).offset(skip).limit(limit).all()
        return storehouses, total

    @staticmethod
    def get_all_storehouses(db: Session) -> List[Storehouse]:
        """Get all storehouses (for dropdowns)."""
        return db.query(Storehouse).order_by(Storehouse.name).all()

    @staticmethod
    def create_storehouse(db: Session, data: StorehouseCreate) -> Storehouse:
        """Create a new storehouse."""
        code = f"SH-{int(time.time() * 1000)}"
        storehouse = Storehouse(
            code=code,
            name=data.name,
            principal=data.principal,
            contact=data.contact,
            address=data.address,
            content=data.content,
            create_date=datetime.utcnow(),
        )
        db.add(storehouse)
        db.commit()
        db.refresh(storehouse)
        return storehouse

    @staticmethod
    def update_storehouse(
        db: Session, storehouse_id: int, data: StorehouseUpdate
    ) -> Optional[Storehouse]:
        """Update a storehouse."""
        storehouse = db.query(Storehouse).filter(Storehouse.id == storehouse_id).first()
        if not storehouse:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(storehouse, field, value)

        db.commit()
        db.refresh(storehouse)
        return storehouse

    @staticmethod
    def delete_storehouse(db: Session, storehouse_id: int) -> bool:
        """Delete a storehouse."""
        storehouse = db.query(Storehouse).filter(Storehouse.id == storehouse_id).first()
        if not storehouse:
            return False
        db.delete(storehouse)
        db.commit()
        return True

    # ConsumableType operations
    @staticmethod
    def get_consumable_type_by_id(db: Session, type_id: int) -> Optional[ConsumableType]:
        """Get consumable type by ID."""
        return db.query(ConsumableType).filter(ConsumableType.id == type_id).first()

    @staticmethod
    def get_consumable_types(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        name: Optional[str] = None,
    ) -> tuple[List[ConsumableType], int]:
        """Get paginated list of consumable types."""
        query = db.query(ConsumableType)

        if name:
            query = query.filter(ConsumableType.name.ilike(f"%{name}%"))

        total = query.count()
        types = query.order_by(ConsumableType.create_date.desc()).offset(skip).limit(limit).all()
        return types, total

    @staticmethod
    def get_all_consumable_types(db: Session) -> List[ConsumableType]:
        """Get all consumable types (for dropdowns)."""
        return db.query(ConsumableType).order_by(ConsumableType.name).all()

    @staticmethod
    def create_consumable_type(db: Session, data: ConsumableTypeCreate) -> ConsumableType:
        """Create a new consumable type."""
        ctype = ConsumableType(
            name=data.name,
            code=data.code or f"CT-{int(time.time() * 1000)}",
            remark=data.remark,
            create_date=datetime.utcnow(),
        )
        db.add(ctype)
        db.commit()
        db.refresh(ctype)
        return ctype

    @staticmethod
    def update_consumable_type(
        db: Session, type_id: int, data: ConsumableTypeUpdate
    ) -> Optional[ConsumableType]:
        """Update a consumable type."""
        ctype = db.query(ConsumableType).filter(ConsumableType.id == type_id).first()
        if not ctype:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(ctype, field, value)

        db.commit()
        db.refresh(ctype)
        return ctype

    @staticmethod
    def delete_consumable_type(db: Session, type_id: int) -> bool:
        """Delete a consumable type."""
        ctype = db.query(ConsumableType).filter(ConsumableType.id == type_id).first()
        if not ctype:
            return False
        db.delete(ctype)
        db.commit()
        return True

    # Unit operations
    @staticmethod
    def get_unit_by_id(db: Session, unit_id: int) -> Optional[Unit]:
        """Get unit by ID."""
        return db.query(Unit).filter(Unit.id == unit_id).first()

    @staticmethod
    def get_units(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        name: Optional[str] = None,
    ) -> tuple[List[Unit], int]:
        """Get paginated list of units."""
        query = db.query(Unit)

        if name:
            query = query.filter(Unit.name.ilike(f"%{name}%"))

        total = query.count()
        units = query.order_by(Unit.create_date.desc()).offset(skip).limit(limit).all()
        return units, total

    @staticmethod
    def get_all_units(db: Session) -> List[Unit]:
        """Get all units (for dropdowns)."""
        return db.query(Unit).order_by(Unit.name).all()

    @staticmethod
    def create_unit(db: Session, data: UnitCreate) -> Unit:
        """Create a new unit."""
        unit = Unit(
            name=data.name,
            remark=data.remark,
            create_date=datetime.utcnow(),
        )
        db.add(unit)
        db.commit()
        db.refresh(unit)
        return unit

    @staticmethod
    def update_unit(db: Session, unit_id: int, data: UnitUpdate) -> Optional[Unit]:
        """Update a unit."""
        unit = db.query(Unit).filter(Unit.id == unit_id).first()
        if not unit:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(unit, field, value)

        db.commit()
        db.refresh(unit)
        return unit

    @staticmethod
    def delete_unit(db: Session, unit_id: int) -> bool:
        """Delete a unit."""
        unit = db.query(Unit).filter(Unit.id == unit_id).first()
        if not unit:
            return False
        db.delete(unit)
        db.commit()
        return True
