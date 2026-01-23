"""Request related models for purchase and goods requests."""

from datetime import datetime
from decimal import Decimal

from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class PurchaseRequest(Base):
    """Purchase request model."""

    __tablename__ = "purchase_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    num = Column(String(50), nullable=False, unique=True)  # Request number (RUR-timestamp)
    user_id = Column(Integer, ForeignKey("users.user_id"))  # Requester
    content = Column(Text)  # Notes/remarks
    status = Column(Integer, default=0)  # 0: pending, 1: approved, 2: rejected, 3: completed
    total_price = Column(Numeric(10, 2), default=Decimal("0.00"))
    create_date = Column(DateTime, default=datetime.utcnow)
    approve_date = Column(DateTime)
    approve_user_id = Column(Integer)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    items = relationship("PurchaseRequestItem", back_populates="purchase_request", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<PurchaseRequest {self.num}>"


class PurchaseRequestItem(Base):
    """Purchase request item detail model."""

    __tablename__ = "purchase_request_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    purchase_request_id = Column(Integer, ForeignKey("purchase_requests.id", ondelete="CASCADE"))
    name = Column(String(200), nullable=False)
    type = Column(String(100))  # Model/specification
    type_id = Column(Integer)  # Category ID
    amount = Column(Integer, default=0)
    unit = Column(String(50))
    price = Column(Numeric(10, 2), default=Decimal("0.00"))

    # Relationships
    purchase_request = relationship("PurchaseRequest", back_populates="items")

    def __repr__(self):
        return f"<PurchaseRequestItem {self.name}>"


class GoodsRequest(Base):
    """Goods request model (for item requisition)."""

    __tablename__ = "goods_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    num = Column(String(50), nullable=False, unique=True)  # Request number (REQ-timestamp)
    purchase_num = Column(String(50))  # Related purchase request number
    user_id = Column(Integer, ForeignKey("users.user_id"))  # Requester
    content = Column(Text)  # Notes/remarks
    status = Column(Integer, default=0)  # 0: submitted, 1: reviewing, 2: approved, 3: rejected
    create_date = Column(DateTime, default=datetime.utcnow)
    approve_date = Column(DateTime)
    approve_user_id = Column(Integer)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    items = relationship("GoodsRequestItem", back_populates="goods_request", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<GoodsRequest {self.num}>"


class GoodsRequestItem(Base):
    """Goods request item detail model."""

    __tablename__ = "goods_request_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    goods_request_id = Column(Integer, ForeignKey("goods_requests.id", ondelete="CASCADE"))
    stock_info_id = Column(Integer, ForeignKey("stock_info.id"))
    name = Column(String(200), nullable=False)
    type = Column(String(100))
    type_id = Column(Integer)
    amount = Column(Integer, default=0)
    stock_amount = Column(Integer, default=0)  # Available stock amount
    unit = Column(String(50))
    price = Column(Numeric(10, 2), default=Decimal("0.00"))

    # Relationships
    goods_request = relationship("GoodsRequest", back_populates="items")
    stock_info = relationship("StockInfo", foreign_keys=[stock_info_id])

    def __repr__(self):
        return f"<GoodsRequestItem {self.name}>"
