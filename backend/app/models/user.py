"""User and role related models."""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    """User account model."""

    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(128), nullable=False)
    email = Column(String(128))
    mobile = Column(String(20))
    status = Column(String(1), default="1")  # 1: active, 0: locked
    ssex = Column(String(1), default="2")  # 0: male, 1: female, 2: unknown
    dept_id = Column(Integer)
    avatar = Column(String(255))
    description = Column(Text)
    create_time = Column(DateTime, default=datetime.utcnow)
    modify_time = Column(DateTime)
    last_login_time = Column(DateTime)

    # Relationships
    user_roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.username}>"


class Role(Base):
    """Role model."""

    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_name = Column(String(50), unique=True, nullable=False)
    remark = Column(String(255))
    create_time = Column(DateTime, default=datetime.utcnow)
    modify_time = Column(DateTime)

    # Relationships
    user_roles = relationship("UserRole", back_populates="role")
    role_menus = relationship("RoleMenu", back_populates="role", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Role {self.role_name}>"


class UserRole(Base):
    """User-Role association model."""

    __tablename__ = "user_roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.role_id", ondelete="CASCADE"), nullable=False)

    # Relationships
    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")


class Menu(Base):
    """Menu model for dynamic navigation."""

    __tablename__ = "menus"

    menu_id = Column(Integer, primary_key=True, autoincrement=True)
    parent_id = Column(Integer, default=0)
    menu_name = Column(String(50), nullable=False)
    path = Column(String(255))
    component = Column(String(255))
    perms = Column(String(50))  # Permission string
    icon = Column(String(50))
    type = Column(String(2))  # 0: menu, 1: button
    order_num = Column(Integer, default=0)
    create_time = Column(DateTime, default=datetime.utcnow)
    modify_time = Column(DateTime)

    # Relationships
    role_menus = relationship("RoleMenu", back_populates="menu")

    def __repr__(self):
        return f"<Menu {self.menu_name}>"


class RoleMenu(Base):
    """Role-Menu association model."""

    __tablename__ = "role_menus"

    id = Column(Integer, primary_key=True, autoincrement=True)
    role_id = Column(Integer, ForeignKey("roles.role_id", ondelete="CASCADE"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menus.menu_id", ondelete="CASCADE"), nullable=False)

    # Relationships
    role = relationship("Role", back_populates="role_menus")
    menu = relationship("Menu", back_populates="role_menus")
