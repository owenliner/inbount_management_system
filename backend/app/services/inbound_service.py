"""Inbound service for handling inbound transactions."""

from datetime import datetime
from typing import Optional, List
from decimal import Decimal
import time

from sqlalchemy.orm import Session

from app.models.stock import StockInfo, StockPut, GoodsBelong
from app.schemas.stock import InboundCreate, InboundItemCreate
from app.services.stock_service import StockService


class InboundService:
    """Service class for inbound operations."""

    @staticmethod
    def get_inbound_by_id(db: Session, inbound_id: int) -> Optional[dict]:
        """Get inbound transaction by ID with items."""
        stock_put = db.query(StockPut).filter(StockPut.id == inbound_id).first()
        if not stock_put:
            return None

        # Get related stock items
        items = (
            db.query(StockInfo)
            .join(GoodsBelong, GoodsBelong.stock_info_id == StockInfo.id)
            .filter(GoodsBelong.stock_put_id == stock_put.id)
            .all()
        )

        return {
            "id": stock_put.id,
            "num": stock_put.num,
            "price": stock_put.price,
            "custodian": stock_put.custodian,
            "put_user": stock_put.put_user,
            "content": stock_put.content,
            "create_date": stock_put.create_date,
            "items": items,
        }

    @staticmethod
    def get_inbounds(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        num: Optional[str] = None,
        custodian: Optional[str] = None,
    ) -> tuple[List[StockPut], int]:
        """Get paginated list of inbound transactions."""
        query = db.query(StockPut)

        if num:
            query = query.filter(StockPut.num.ilike(f"%{num}%"))
        if custodian:
            query = query.filter(StockPut.custodian.ilike(f"%{custodian}%"))

        total = query.count()
        inbounds = query.order_by(StockPut.create_date.desc()).offset(skip).limit(limit).all()
        return inbounds, total

    @staticmethod
    def create_inbound(db: Session, data: InboundCreate) -> StockPut:
        """
        Create an inbound transaction.

        This will:
        1. Create a StockPut record
        2. Create StockInfo records for each item (is_in=1 for tracking)
        3. Update or create warehouse stock (is_in=0) with the new amounts
        4. Create GoodsBelong records linking items to the transaction
        """
        # Generate transaction number
        num = f"PUT-{int(time.time() * 1000)}"

        # Calculate total price
        total_price = sum(item.amount * item.price for item in data.items)

        # Create StockPut record
        stock_put = StockPut(
            num=num,
            price=total_price,
            custodian=data.custodian,
            put_user=data.put_user,
            content=data.content,
            create_date=datetime.utcnow(),
        )
        db.add(stock_put)
        db.flush()  # Get the ID without committing

        # Process each item
        for item in data.items:
            # Create inbound record (is_in=1) for tracking
            stock_info = StockInfo(
                name=item.name,
                type_id=item.type_id,
                type=item.type,
                amount=item.amount,
                unit=item.unit,
                price=item.price,
                stock_id=data.stock_id,
                is_in=1,  # Inbound record
                create_date=datetime.utcnow(),
            )
            db.add(stock_info)
            db.flush()

            # Create GoodsBelong record
            goods_belong = GoodsBelong(
                stock_info_id=stock_info.id,
                stock_put_id=stock_put.id,
                amount=item.amount,
                price=item.price * item.amount,
                create_date=datetime.utcnow(),
            )
            db.add(goods_belong)

            # Update warehouse stock (is_in=0)
            warehouse_stock = StockService.find_or_create_warehouse_stock(
                db=db,
                name=item.name,
                type_id=item.type_id,
                type_spec=item.type,
                unit=item.unit,
                stock_id=data.stock_id,
            )
            warehouse_stock.amount += item.amount
            # Update price to weighted average
            if warehouse_stock.price and warehouse_stock.amount > 0:
                old_total = float(warehouse_stock.price) * (warehouse_stock.amount - item.amount)
                new_total = old_total + float(item.price) * item.amount
                warehouse_stock.price = Decimal(str(new_total / warehouse_stock.amount))
            else:
                warehouse_stock.price = item.price

        db.commit()
        db.refresh(stock_put)
        return stock_put

    @staticmethod
    def import_from_excel(
        db: Session,
        stock_id: int,
        custodian: str,
        put_user: str,
        items: List[dict],
        content: Optional[str] = None,
    ) -> StockPut:
        """
        Import inbound items from Excel data.

        Args:
            stock_id: Warehouse ID
            custodian: Custodian name
            put_user: User receiving goods
            items: List of item dicts with keys: name, type, type_id, amount, unit, price
            content: Optional notes
        """
        inbound_items = []
        for item in items:
            inbound_items.append(
                InboundItemCreate(
                    name=item.get("name", ""),
                    type=item.get("type"),
                    type_id=item.get("type_id"),
                    amount=int(item.get("amount", 0)),
                    unit=item.get("unit"),
                    price=Decimal(str(item.get("price", 0))),
                )
            )

        inbound_data = InboundCreate(
            stock_id=stock_id,
            custodian=custodian,
            put_user=put_user,
            content=content,
            items=inbound_items,
        )

        return InboundService.create_inbound(db, inbound_data)

    @staticmethod
    def delete_inbound(db: Session, inbound_id: int) -> bool:
        """
        Delete an inbound transaction.

        Note: This will also need to reverse the stock amounts.
        """
        stock_put = db.query(StockPut).filter(StockPut.id == inbound_id).first()
        if not stock_put:
            return False

        # Get all related items and reverse the stock changes
        goods_belongs = (
            db.query(GoodsBelong).filter(GoodsBelong.stock_put_id == stock_put.id).all()
        )

        for gb in goods_belongs:
            # Get the inbound stock info
            stock_info = db.query(StockInfo).filter(StockInfo.id == gb.stock_info_id).first()
            if stock_info:
                # Find and update the warehouse stock
                warehouse_stock = (
                    db.query(StockInfo)
                    .filter(
                        StockInfo.name == stock_info.name,
                        StockInfo.type_id == stock_info.type_id,
                        StockInfo.stock_id == stock_info.stock_id,
                        StockInfo.is_in == 0,
                    )
                    .first()
                )
                if warehouse_stock:
                    warehouse_stock.amount = max(0, warehouse_stock.amount - gb.amount)

                # Delete the inbound stock info
                db.delete(stock_info)

            # Delete the goods belong record
            db.delete(gb)

        # Delete the stock put record
        db.delete(stock_put)
        db.commit()
        return True
