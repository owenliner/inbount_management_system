"""Request service for purchase and goods request management."""

from datetime import datetime
from typing import Optional, List
from decimal import Decimal
import time

from sqlalchemy.orm import Session

from app.models.request import (
    PurchaseRequest,
    PurchaseRequestItem,
    GoodsRequest,
    GoodsRequestItem,
)
from app.models.user import User
from app.schemas.request import (
    PurchaseRequestCreate,
    PurchaseRequestUpdate,
    GoodsRequestCreate,
    GoodsRequestUpdate,
)


class RequestService:
    """Service class for request operations."""

    # Purchase Request operations
    @staticmethod
    def get_purchase_request_by_id(db: Session, request_id: int) -> Optional[dict]:
        """Get purchase request by ID with items."""
        request = db.query(PurchaseRequest).filter(PurchaseRequest.id == request_id).first()
        if not request:
            return None

        user = db.query(User).filter(User.user_id == request.user_id).first()

        items = (
            db.query(PurchaseRequestItem)
            .filter(PurchaseRequestItem.purchase_request_id == request.id)
            .all()
        )

        return {
            "id": request.id,
            "num": request.num,
            "user_id": request.user_id,
            "username": user.username if user else None,
            "content": request.content,
            "status": request.status,
            "total_price": request.total_price,
            "create_date": request.create_date,
            "approve_date": request.approve_date,
            "items": items,
        }

    @staticmethod
    def get_purchase_requests(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        num: Optional[str] = None,
        status: Optional[int] = None,
        user_id: Optional[int] = None,
    ) -> tuple[List[dict], int]:
        """Get paginated list of purchase requests."""
        query = db.query(PurchaseRequest)

        if num:
            query = query.filter(PurchaseRequest.num.ilike(f"%{num}%"))
        if status is not None:
            query = query.filter(PurchaseRequest.status == status)
        if user_id:
            query = query.filter(PurchaseRequest.user_id == user_id)

        total = query.count()
        requests = query.order_by(PurchaseRequest.create_date.desc()).offset(skip).limit(limit).all()

        result = []
        for req in requests:
            user = db.query(User).filter(User.user_id == req.user_id).first()
            result.append({
                "id": req.id,
                "num": req.num,
                "user_id": req.user_id,
                "username": user.username if user else None,
                "content": req.content,
                "status": req.status,
                "total_price": req.total_price,
                "create_date": req.create_date,
                "approve_date": req.approve_date,
            })

        return result, total

    @staticmethod
    def create_purchase_request(
        db: Session, user_id: int, data: PurchaseRequestCreate
    ) -> PurchaseRequest:
        """Create a new purchase request."""
        num = f"RUR-{int(time.time() * 1000)}"

        total_price = sum(item.amount * item.price for item in data.items)

        request = PurchaseRequest(
            num=num,
            user_id=user_id,
            content=data.content,
            status=0,  # Pending
            total_price=total_price,
            create_date=datetime.utcnow(),
        )
        db.add(request)
        db.flush()

        for item in data.items:
            request_item = PurchaseRequestItem(
                purchase_request_id=request.id,
                name=item.name,
                type=item.type,
                type_id=item.type_id,
                amount=item.amount,
                unit=item.unit,
                price=item.price,
            )
            db.add(request_item)

        db.commit()
        db.refresh(request)
        return request

    @staticmethod
    def update_purchase_request(
        db: Session, request_id: int, data: PurchaseRequestUpdate
    ) -> Optional[PurchaseRequest]:
        """Update a purchase request."""
        request = db.query(PurchaseRequest).filter(PurchaseRequest.id == request_id).first()
        if not request:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(request, field, value)

        db.commit()
        db.refresh(request)
        return request

    @staticmethod
    def approve_purchase_request(
        db: Session, request_id: int, approve_user_id: int, approved: bool
    ) -> Optional[PurchaseRequest]:
        """Approve or reject a purchase request."""
        request = db.query(PurchaseRequest).filter(PurchaseRequest.id == request_id).first()
        if not request:
            return None

        request.status = 1 if approved else 2  # 1=approved, 2=rejected
        request.approve_date = datetime.utcnow()
        request.approve_user_id = approve_user_id

        db.commit()
        db.refresh(request)
        return request

    @staticmethod
    def delete_purchase_request(db: Session, request_id: int) -> bool:
        """Delete a purchase request."""
        request = db.query(PurchaseRequest).filter(PurchaseRequest.id == request_id).first()
        if not request:
            return False
        db.delete(request)
        db.commit()
        return True

    # Goods Request operations
    @staticmethod
    def get_goods_request_by_id(db: Session, request_id: int) -> Optional[dict]:
        """Get goods request by ID with items."""
        request = db.query(GoodsRequest).filter(GoodsRequest.id == request_id).first()
        if not request:
            return None

        user = db.query(User).filter(User.user_id == request.user_id).first()

        items = (
            db.query(GoodsRequestItem)
            .filter(GoodsRequestItem.goods_request_id == request.id)
            .all()
        )

        status_map = {0: "已提交", 1: "正在审核", 2: "审核通过", 3: "已驳回"}

        return {
            "id": request.id,
            "num": request.num,
            "purchase_num": request.purchase_num,
            "user_id": request.user_id,
            "username": user.username if user else None,
            "content": request.content,
            "status": request.status,
            "status_text": status_map.get(request.status, "未知"),
            "create_date": request.create_date,
            "approve_date": request.approve_date,
            "items": items,
        }

    @staticmethod
    def get_goods_requests(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        num: Optional[str] = None,
        status: Optional[int] = None,
        user_id: Optional[int] = None,
    ) -> tuple[List[dict], int]:
        """Get paginated list of goods requests."""
        query = db.query(GoodsRequest)

        if num:
            query = query.filter(GoodsRequest.num.ilike(f"%{num}%"))
        if status is not None:
            query = query.filter(GoodsRequest.status == status)
        if user_id:
            query = query.filter(GoodsRequest.user_id == user_id)

        total = query.count()
        requests = query.order_by(GoodsRequest.create_date.desc()).offset(skip).limit(limit).all()

        status_map = {0: "已提交", 1: "正在审核", 2: "审核通过", 3: "已驳回"}

        result = []
        for req in requests:
            user = db.query(User).filter(User.user_id == req.user_id).first()
            result.append({
                "id": req.id,
                "num": req.num,
                "purchase_num": req.purchase_num,
                "user_id": req.user_id,
                "username": user.username if user else None,
                "content": req.content,
                "status": req.status,
                "status_text": status_map.get(req.status, "未知"),
                "create_date": req.create_date,
                "approve_date": req.approve_date,
            })

        return result, total

    @staticmethod
    def create_goods_request(
        db: Session, user_id: int, data: GoodsRequestCreate
    ) -> GoodsRequest:
        """Create a new goods request."""
        num = f"REQ-{int(time.time() * 1000)}"

        request = GoodsRequest(
            num=num,
            purchase_num=data.purchase_num,
            user_id=user_id,
            content=data.content,
            status=0,  # Submitted
            create_date=datetime.utcnow(),
        )
        db.add(request)
        db.flush()

        for item in data.items:
            request_item = GoodsRequestItem(
                goods_request_id=request.id,
                stock_info_id=item.stock_info_id,
                name=item.name,
                type=item.type,
                type_id=item.type_id,
                amount=item.amount,
                stock_amount=item.stock_amount,
                unit=item.unit,
                price=item.price,
            )
            db.add(request_item)

        db.commit()
        db.refresh(request)
        return request

    @staticmethod
    def approve_goods_request(
        db: Session, request_id: int, approve_user_id: int, approved: bool
    ) -> Optional[GoodsRequest]:
        """Approve or reject a goods request."""
        request = db.query(GoodsRequest).filter(GoodsRequest.id == request_id).first()
        if not request:
            return None

        request.status = 2 if approved else 3  # 2=approved, 3=rejected
        request.approve_date = datetime.utcnow()
        request.approve_user_id = approve_user_id

        db.commit()
        db.refresh(request)
        return request

    @staticmethod
    def delete_goods_request(db: Session, request_id: int) -> bool:
        """Delete a goods request."""
        request = db.query(GoodsRequest).filter(GoodsRequest.id == request_id).first()
        if not request:
            return False
        db.delete(request)
        db.commit()
        return True
