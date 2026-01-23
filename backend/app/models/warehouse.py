"""Warehouse related models."""

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Text

from app.database import Base


class Storehouse(Base):
    """Storehouse/Warehouse model."""

    __tablename__ = "storehouses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    code = Column(String(50), unique=True, nullable=False)  # Generated as "SH-" + timestamp
    name = Column(String(100), nullable=False)
    principal = Column(String(50))  # Warehouse manager
    contact = Column(String(50))  # Contact information
    address = Column(String(255))
    content = Column(Text)  # Remarks
    create_date = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Storehouse {self.name}>"


class ConsumableType(Base):
    """Consumable/Item type classification model."""

    __tablename__ = "consumable_types"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True)
    remark = Column(Text)
    create_date = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ConsumableType {self.name}>"


class Unit(Base):
    """Unit of measurement model."""

    __tablename__ = "units"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), nullable=False, unique=True)
    remark = Column(Text)
    create_date = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Unit {self.name}>"
