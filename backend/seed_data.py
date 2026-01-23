"""Seed initial data for development."""

from app.database import SessionLocal, engine, Base
from app.models.user import User, Role, UserRole
from app.models.warehouse import Storehouse, ConsumableType, Unit
from app.core.security import get_password_hash

def seed_database():
    """Create initial data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Check if admin user exists
        existing_user = db.query(User).filter(User.username == "admin").first()
        if existing_user:
            print("Admin user already exists, skipping user seed")
        else:
            # Create admin role
            admin_role = Role(
                role_name="ADMIN",
                remark="System Administrator"
            )
            db.add(admin_role)
            db.flush()

            # Create admin user
            admin_user = User(
                username="admin",
                password=get_password_hash("admin123"),
                email="admin@example.com",
                mobile="13800138000",
                status="1",
                ssex="0"
            )
            db.add(admin_user)
            db.flush()

            # Create user-role association
            user_role = UserRole(
                user_id=admin_user.user_id,
                role_id=admin_role.role_id
            )
            db.add(user_role)
            db.commit()
            print("Admin user created: admin / admin123")

        # Create sample warehouse
        existing_warehouse = db.query(Storehouse).first()
        if not existing_warehouse:
            warehouse = Storehouse(
                code="WH001",
                name="主仓库",
                principal="张三",
                contact="13800138001",
                address="北京市朝阳区"
            )
            db.add(warehouse)
            db.commit()
            print("Sample warehouse created")

        # Create sample consumable types
        existing_type = db.query(ConsumableType).first()
        if not existing_type:
            types = [
                ConsumableType(name="办公用品", code="OFC", remark="办公室使用的文具等"),
                ConsumableType(name="电子设备", code="ELE", remark="电脑、打印机等"),
                ConsumableType(name="清洁用品", code="CLN", remark="清洁耗材"),
            ]
            db.add_all(types)
            db.commit()
            print("Sample consumable types created")

        # Create sample units
        existing_unit = db.query(Unit).first()
        if not existing_unit:
            units = [
                Unit(name="个", remark="计数单位"),
                Unit(name="箱", remark="包装单位"),
                Unit(name="包", remark="包装单位"),
                Unit(name="瓶", remark="液体包装"),
            ]
            db.add_all(units)
            db.commit()
            print("Sample units created")

        print("Database seeding completed!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
