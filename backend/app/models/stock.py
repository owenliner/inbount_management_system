"""Stock/Inventory related models."""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class StockInfo(Base):
    """
    Stock information model.

    is_in field:
        0: Warehouse stock (in storage)
        1: Inbound (being received)
        2: Outbound (being dispatched)
    """

    __tablename__ = "stock_info"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)  # Item name
    type_id = Column(Integer, ForeignKey("consumable_types.id"))  # Category ID
    type = Column(String(100))  # Model/specification
    amount = Column(Integer, default=0)  # Quantity
    unit = Column(String(50))  # Unit of measurement
    content = Column(Text)  # Notes/remarks
    price = Column(Numeric(10, 2), default=Decimal("0.00"))  # Unit price
    create_date = Column(DateTime, default=datetime.utcnow)
    is_in = Column(Integer, default=0)  # 0=stock, 1=inbound, 2=outbound
    to_user_id = Column(Integer)  # Recipient user ID for outbound
    parent_id = Column(Integer)  # Parent warehouse ID reference
    stock_id = Column(Integer, ForeignKey("storehouses.id"))  # Warehouse location ID

    # Relationships
    consumable_type = relationship("ConsumableType", foreign_keys=[type_id])
    storehouse = relationship("Storehouse", foreign_keys=[stock_id])

    def __repr__(self):
        return f"<StockInfo {self.name}>"


class StockPut(Base):
    """Inbound transaction record model."""

    __tablename__ = "stock_put"

    id = Column(Integer, primary_key=True, autoincrement=True)
    num = Column(String(50), nullable=False, unique=True)  # Transaction number
    price = Column(Numeric(10, 2), default=Decimal("0.00"))  # Total inbound value
    custodian = Column(String(50))  # Warehouse custodian name
    put_user = Column(String(50))  # User receiving goods
    content = Column(Text)  # Notes
    create_date = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<StockPut {self.num}>"


class StockOut(Base):
    """Outbound transaction record model (reserved for delivery system)."""

    __tablename__ = "stock_out"

    id = Column(Integer, primary_key=True, autoincrement=True)
    num = Column(String(50), nullable=False, unique=True)  # Transaction number
    price = Column(Numeric(10, 2), default=Decimal("0.00"))  # Total outbound value
    custodian = Column(String(50))  # Warehouse custodian
    out_user = Column(String(50))  # User dispatching goods
    receive_user = Column(String(50))  # User receiving goods
    content = Column(Text)  # Notes
    create_date = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<StockOut {self.num}>"


class GoodsBelong(Base):
    """Order detail / goods belonging model."""

    __tablename__ = "goods_belong"

    id = Column(Integer, primary_key=True, autoincrement=True)
    stock_info_id = Column(Integer, ForeignKey("stock_info.id"))
    stock_put_id = Column(Integer, ForeignKey("stock_put.id"))
    stock_out_id = Column(Integer, ForeignKey("stock_out.id"))
    amount = Column(Integer, default=0)
    price = Column(Numeric(10, 2), default=Decimal("0.00"))
    create_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    stock_info = relationship("StockInfo", foreign_keys=[stock_info_id])
    stock_put = relationship("StockPut", foreign_keys=[stock_put_id])
    stock_out = relationship("StockOut", foreign_keys=[stock_out_id])

    def __repr__(self):
        return f"<GoodsBelong {self.id}>"
