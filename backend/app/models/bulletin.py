"""Bulletin/Announcement model."""

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Text

from app.database import Base


class Bulletin(Base):
    """Bulletin/Announcement model."""

    __tablename__ = "bulletins"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    content = Column(Text)
    author = Column(String(50))
    create_date = Column(DateTime, default=datetime.utcnow)
    update_date = Column(DateTime)
    status = Column(Integer, default=1)  # 1: active, 0: inactive

    def __repr__(self):
        return f"<Bulletin {self.title}>"
