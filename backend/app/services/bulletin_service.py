"""Bulletin service for announcement management."""

from datetime import datetime
from typing import Optional, List

from sqlalchemy.orm import Session

from app.models.bulletin import Bulletin
from app.schemas.bulletin import BulletinCreate, BulletinUpdate


class BulletinService:
    """Service class for bulletin operations."""

    @staticmethod
    def get_bulletin_by_id(db: Session, bulletin_id: int) -> Optional[Bulletin]:
        """Get bulletin by ID."""
        return db.query(Bulletin).filter(Bulletin.id == bulletin_id).first()

    @staticmethod
    def get_bulletins(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        title: Optional[str] = None,
        status: Optional[int] = None,
    ) -> tuple[List[Bulletin], int]:
        """Get paginated list of bulletins."""
        query = db.query(Bulletin)

        if title:
            query = query.filter(Bulletin.title.ilike(f"%{title}%"))
        if status is not None:
            query = query.filter(Bulletin.status == status)

        total = query.count()
        bulletins = query.order_by(Bulletin.create_date.desc()).offset(skip).limit(limit).all()
        return bulletins, total

    @staticmethod
    def get_active_bulletins(db: Session, limit: int = 10) -> List[Bulletin]:
        """Get active bulletins for display."""
        return (
            db.query(Bulletin)
            .filter(Bulletin.status == 1)
            .order_by(Bulletin.create_date.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def create_bulletin(db: Session, data: BulletinCreate) -> Bulletin:
        """Create a new bulletin."""
        bulletin = Bulletin(
            title=data.title,
            content=data.content,
            author=data.author,
            status=1,
            create_date=datetime.utcnow(),
        )
        db.add(bulletin)
        db.commit()
        db.refresh(bulletin)
        return bulletin

    @staticmethod
    def update_bulletin(
        db: Session, bulletin_id: int, data: BulletinUpdate
    ) -> Optional[Bulletin]:
        """Update a bulletin."""
        bulletin = db.query(Bulletin).filter(Bulletin.id == bulletin_id).first()
        if not bulletin:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(bulletin, field, value)

        bulletin.update_date = datetime.utcnow()

        db.commit()
        db.refresh(bulletin)
        return bulletin

    @staticmethod
    def delete_bulletin(db: Session, bulletin_id: int) -> bool:
        """Delete a bulletin."""
        bulletin = db.query(Bulletin).filter(Bulletin.id == bulletin_id).first()
        if not bulletin:
            return False
        db.delete(bulletin)
        db.commit()
        return True
