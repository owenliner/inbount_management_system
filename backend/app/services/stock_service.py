"""Stock service for stock management operations."""

from datetime import datetime
from typing import Optional, List
from decimal import Decimal

from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.stock import StockInfo, GoodsBelong
from app.models.warehouse import ConsumableType, Storehouse
from app.schemas.stock import StockInfoCreate, StockInfoUpdate


class StockService:
    """Service class for stock operations."""

    @staticmethod
    def get_stock_by_id(db: Session, stock_id: int) -> Optional[StockInfo]:
        """Get stock info by ID."""
        return db.query(StockInfo).filter(StockInfo.id == stock_id).first()

    @staticmethod
    def get_stocks(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        name: Optional[str] = None,
        type_id: Optional[int] = None,
        stock_id: Optional[int] = None,
        is_in: int = 0,
    ) -> tuple[List[dict], int]:
        """
        Get paginated list of stocks with additional info.

        Args:
            is_in: 0=warehouse stock, 1=inbound, 2=outbound
        """
        query = db.query(StockInfo).filter(StockInfo.is_in == is_in)

        if name:
            query = query.filter(StockInfo.name.ilike(f"%{name}%"))
        if type_id:
            query = query.filter(StockInfo.type_id == type_id)
        if stock_id:
            query = query.filter(StockInfo.stock_id == stock_id)

        total = query.count()
        stocks = query.order_by(StockInfo.create_date.desc()).offset(skip).limit(limit).all()

        # Enrich with type and storehouse names
        result = []
        for stock in stocks:
            stock_dict = {
                "id": stock.id,
                "name": stock.name,
                "type_id": stock.type_id,
                "type": stock.type,
                "amount": stock.amount,
                "unit": stock.unit,
                "content": stock.content,
                "price": stock.price,
                "is_in": stock.is_in,
                "stock_id": stock.stock_id,
                "create_date": stock.create_date,
                "type_name": None,
                "storehouse_name": None,
            }

            if stock.type_id:
                ctype = db.query(ConsumableType).filter(ConsumableType.id == stock.type_id).first()
                if ctype:
                    stock_dict["type_name"] = ctype.name

            if stock.stock_id:
                storehouse = db.query(Storehouse).filter(Storehouse.id == stock.stock_id).first()
                if storehouse:
                    stock_dict["storehouse_name"] = storehouse.name

            result.append(stock_dict)

        return result, total

    @staticmethod
    def get_stock_detail(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        name: Optional[str] = None,
        type_id: Optional[int] = None,
        is_in: Optional[int] = None,
    ) -> tuple[List[dict], int]:
        """
        Get inbound/outbound detail history.
        """
        query = db.query(StockInfo).filter(StockInfo.is_in.in_([1, 2]))

        if name:
            query = query.filter(StockInfo.name.ilike(f"%{name}%"))
        if type_id:
            query = query.filter(StockInfo.type_id == type_id)
        if is_in is not None:
            query = query.filter(StockInfo.is_in == is_in)

        total = query.count()
        stocks = query.order_by(StockInfo.create_date.desc()).offset(skip).limit(limit).all()

        result = []
        for stock in stocks:
            status_text = "入库" if stock.is_in == 1 else "出库"
            stock_dict = {
                "id": stock.id,
                "name": stock.name,
                "type": stock.type,
                "type_id": stock.type_id,
                "amount": stock.amount,
                "unit": stock.unit,
                "price": stock.price,
                "is_in": stock.is_in,
                "status_text": status_text,
                "create_date": stock.create_date,
                "type_name": None,
                "storehouse_name": None,
            }

            if stock.type_id:
                ctype = db.query(ConsumableType).filter(ConsumableType.id == stock.type_id).first()
                if ctype:
                    stock_dict["type_name"] = ctype.name

            if stock.stock_id:
                storehouse = db.query(Storehouse).filter(Storehouse.id == stock.stock_id).first()
                if storehouse:
                    stock_dict["storehouse_name"] = storehouse.name

            result.append(stock_dict)

        return result, total

    @staticmethod
    def get_stock_summary(db: Session, stock_id: Optional[int] = None) -> List[dict]:
        """
        Get aggregated stock summary grouped by item name and type.
        """
        query = db.query(
            StockInfo.name,
            StockInfo.type,
            StockInfo.type_id,
            StockInfo.unit,
            func.sum(StockInfo.amount).label("total_amount"),
            func.avg(StockInfo.price).label("avg_price"),
        ).filter(StockInfo.is_in == 0)

        if stock_id:
            query = query.filter(StockInfo.stock_id == stock_id)

        query = query.group_by(
            StockInfo.name, StockInfo.type, StockInfo.type_id, StockInfo.unit
        )

        results = query.all()

        return [
            {
                "name": r.name,
                "type": r.type,
                "type_id": r.type_id,
                "unit": r.unit,
                "total_amount": r.total_amount,
                "avg_price": float(r.avg_price) if r.avg_price else 0,
            }
            for r in results
        ]

    @staticmethod
    def create_stock(db: Session, data: StockInfoCreate) -> StockInfo:
        """Create a new stock record."""
        stock = StockInfo(
            name=data.name,
            type_id=data.type_id,
            type=data.type,
            amount=data.amount,
            unit=data.unit,
            content=data.content,
            price=data.price,
            stock_id=data.stock_id,
            is_in=data.is_in,
            create_date=datetime.utcnow(),
        )
        db.add(stock)
        db.commit()
        db.refresh(stock)
        return stock

    @staticmethod
    def update_stock(db: Session, stock_id: int, data: StockInfoUpdate) -> Optional[StockInfo]:
        """Update a stock record."""
        stock = db.query(StockInfo).filter(StockInfo.id == stock_id).first()
        if not stock:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(stock, field, value)

        db.commit()
        db.refresh(stock)
        return stock

    @staticmethod
    def delete_stock(db: Session, stock_id: int) -> bool:
        """Delete a stock record."""
        stock = db.query(StockInfo).filter(StockInfo.id == stock_id).first()
        if not stock:
            return False
        db.delete(stock)
        db.commit()
        return True

    @staticmethod
    def update_stock_amount(
        db: Session, stock_id: int, amount_change: int, is_add: bool = True
    ) -> Optional[StockInfo]:
        """
        Update stock amount.

        Args:
            stock_id: Stock record ID
            amount_change: Amount to add or subtract
            is_add: True to add, False to subtract
        """
        stock = db.query(StockInfo).filter(StockInfo.id == stock_id).first()
        if not stock:
            return None

        if is_add:
            stock.amount += amount_change
        else:
            stock.amount = max(0, stock.amount - amount_change)

        db.commit()
        db.refresh(stock)
        return stock

    @staticmethod
    def find_or_create_warehouse_stock(
        db: Session,
        name: str,
        type_id: Optional[int],
        type_spec: Optional[str],
        unit: Optional[str],
        stock_id: int,
    ) -> StockInfo:
        """
        Find existing warehouse stock or create new one.
        Used for aggregating inventory.
        """
        query = db.query(StockInfo).filter(
            StockInfo.name == name,
            StockInfo.stock_id == stock_id,
            StockInfo.is_in == 0,
        )

        if type_id:
            query = query.filter(StockInfo.type_id == type_id)
        if type_spec:
            query = query.filter(StockInfo.type == type_spec)

        stock = query.first()

        if not stock:
            stock = StockInfo(
                name=name,
                type_id=type_id,
                type=type_spec,
                amount=0,
                unit=unit,
                stock_id=stock_id,
                is_in=0,
                create_date=datetime.utcnow(),
            )
            db.add(stock)
            db.commit()
            db.refresh(stock)

        return stock
