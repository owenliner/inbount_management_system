"""User service for user management operations."""

from datetime import datetime
from typing import Optional, List

from sqlalchemy.orm import Session

from app.models.user import User, Role, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password


class UserService:
    """Service class for user operations."""

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.user_id == user_id).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username."""
        return db.query(User).filter(User.username == username.lower()).first()

    @staticmethod
    def get_users(
        db: Session,
        skip: int = 0,
        limit: int = 10,
        username: Optional[str] = None,
        status: Optional[str] = None,
    ) -> tuple[List[User], int]:
        """Get paginated list of users."""
        query = db.query(User)

        if username:
            query = query.filter(User.username.ilike(f"%{username}%"))
        if status:
            query = query.filter(User.status == status)

        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return users, total

    @staticmethod
    def create(db: Session, user_data: UserCreate) -> User:
        """Create a new user."""
        user = User(
            username=user_data.username.lower(),
            password=get_password_hash(user_data.password),
            email=user_data.email,
            mobile=user_data.mobile,
            ssex=user_data.ssex,
            dept_id=user_data.dept_id,
            avatar=user_data.avatar,
            description=user_data.description,
            status="1",
            create_time=datetime.utcnow(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        # Assign roles
        if user_data.role_ids:
            for role_id in user_data.role_ids:
                user_role = UserRole(user_id=user.user_id, role_id=role_id)
                db.add(user_role)
            db.commit()

        return user

    @staticmethod
    def update(db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """Update a user."""
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return None

        update_data = user_data.model_dump(exclude_unset=True)
        role_ids = update_data.pop("role_ids", None)

        for field, value in update_data.items():
            setattr(user, field, value)

        user.modify_time = datetime.utcnow()

        # Update roles if provided
        if role_ids is not None:
            db.query(UserRole).filter(UserRole.user_id == user_id).delete()
            for role_id in role_ids:
                user_role = UserRole(user_id=user_id, role_id=role_id)
                db.add(user_role)

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        """Delete a user."""
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return False
        db.delete(user)
        db.commit()
        return True

    @staticmethod
    def authenticate(db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate a user."""
        user = UserService.get_by_username(db, username)
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user

    @staticmethod
    def get_user_roles(db: Session, user_id: int) -> List[str]:
        """Get user's role names."""
        roles = (
            db.query(Role)
            .join(UserRole, Role.role_id == UserRole.role_id)
            .filter(UserRole.user_id == user_id)
            .all()
        )
        return [role.role_name for role in roles]

    @staticmethod
    def update_last_login(db: Session, user_id: int) -> None:
        """Update user's last login time."""
        user = db.query(User).filter(User.user_id == user_id).first()
        if user:
            user.last_login_time = datetime.utcnow()
            db.commit()

    @staticmethod
    def change_password(
        db: Session, user_id: int, old_password: str, new_password: str
    ) -> bool:
        """Change user's password."""
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return False

        # Verify old password
        if not verify_password(old_password, user.password):
            return False

        # Update password
        user.password = get_password_hash(new_password)
        user.modify_time = datetime.utcnow()
        db.commit()
        return True
