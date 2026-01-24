"""Seed initial data for development."""

from datetime import datetime, timedelta
from decimal import Decimal
import random

from app.database import SessionLocal, engine, Base
from app.models.user import User, Role, UserRole
from app.models.warehouse import Storehouse, ConsumableType, Unit
from app.models.stock import StockInfo, StockPut, GoodsBelong
from app.models.request import PurchaseRequest, PurchaseRequestItem, GoodsRequest, GoodsRequestItem
from app.models.bulletin import Bulletin
from app.core.security import get_password_hash


def seed_database():
    """Create initial data."""
    # Create all tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ========== 1. Users and Roles ==========
        existing_user = db.query(User).filter(User.username == "admin").first()
        if existing_user:
            print("Admin user already exists, skipping user seed")
            admin_user = existing_user
            admin_role = db.query(Role).filter(Role.role_name == "ADMIN").first()
        else:
            # Create roles
            admin_role = Role(role_name="ADMIN", remark="System Administrator")
            manager_role = Role(role_name="MANAGER", remark="Warehouse Manager")
            operator_role = Role(role_name="OPERATOR", remark="Warehouse Operator")
            db.add_all([admin_role, manager_role, operator_role])
            db.flush()

            # Create users
            users_data = [
                {"username": "admin", "password": "admin123", "email": "admin@example.com",
                 "mobile": "13800138000", "ssex": "0", "role": admin_role},
                {"username": "zhangsan", "password": "123456", "email": "zhangsan@example.com",
                 "mobile": "13900139001", "ssex": "0", "role": manager_role},
                {"username": "lisi", "password": "123456", "email": "lisi@example.com",
                 "mobile": "13900139002", "ssex": "1", "role": operator_role},
                {"username": "wangwu", "password": "123456", "email": "wangwu@example.com",
                 "mobile": "13900139003", "ssex": "0", "role": operator_role},
            ]

            for user_data in users_data:
                user = User(
                    username=user_data["username"],
                    password=get_password_hash(user_data["password"]),
                    email=user_data["email"],
                    mobile=user_data["mobile"],
                    status="1",
                    ssex=user_data["ssex"]
                )
                db.add(user)
                db.flush()
                user_role = UserRole(user_id=user.user_id, role_id=user_data["role"].role_id)
                db.add(user_role)
                if user_data["username"] == "admin":
                    admin_user = user

            db.commit()
            print("Users created: admin, zhangsan, lisi, wangwu (password: admin123/123456)")

        # ========== 2. Warehouses ==========
        existing_warehouse = db.query(Storehouse).first()
        if not existing_warehouse:
            warehouses = [
                Storehouse(code="WH001", name="主仓库", principal="张三",
                          contact="13800138001", address="北京市朝阳区建国路88号"),
                Storehouse(code="WH002", name="东区仓库", principal="李四",
                          contact="13800138002", address="北京市东城区东直门大街56号"),
                Storehouse(code="WH003", name="西区仓库", principal="王五",
                          contact="13800138003", address="北京市西城区西单北大街120号"),
                Storehouse(code="WH004", name="南区仓库", principal="赵六",
                          contact="13800138004", address="北京市丰台区南三环西路16号"),
                Storehouse(code="WH005", name="备用仓库", principal="钱七",
                          contact="13800138005", address="北京市通州区新华大街100号"),
            ]
            db.add_all(warehouses)
            db.commit()
            print("5 warehouses created")
        else:
            warehouses = db.query(Storehouse).all()

        # ========== 3. Consumable Types ==========
        existing_type = db.query(ConsumableType).first()
        if not existing_type:
            types = [
                ConsumableType(name="办公用品", code="OFC", remark="办公室使用的文具等"),
                ConsumableType(name="电子设备", code="ELE", remark="电脑、打印机等"),
                ConsumableType(name="清洁用品", code="CLN", remark="清洁耗材"),
                ConsumableType(name="劳保用品", code="LBR", remark="劳动保护用品"),
                ConsumableType(name="食品饮料", code="FOD", remark="员工福利食品"),
                ConsumableType(name="维修工具", code="TOL", remark="维修保养工具"),
            ]
            db.add_all(types)
            db.commit()
            print("6 consumable types created")
        consumable_types = db.query(ConsumableType).all()

        # ========== 4. Units ==========
        existing_unit = db.query(Unit).first()
        if not existing_unit:
            units = [
                Unit(name="个", remark="计数单位"),
                Unit(name="箱", remark="包装单位"),
                Unit(name="包", remark="包装单位"),
                Unit(name="瓶", remark="液体包装"),
                Unit(name="台", remark="设备单位"),
                Unit(name="套", remark="成套单位"),
                Unit(name="卷", remark="卷装单位"),
                Unit(name="把", remark="工具单位"),
            ]
            db.add_all(units)
            db.commit()
            print("8 units created")

        # ========== 5. Stock Items ==========
        existing_stock = db.query(StockInfo).first()
        warehouses = db.query(Storehouse).all()
        if not existing_stock and warehouses:
            stock_items = [
                # 办公用品
                {"name": "A4打印纸", "type_id": 1, "type": "70g", "amount": 150, "unit": "箱",
                 "price": Decimal("45.00"), "stock_id": warehouses[0].id},
                {"name": "中性笔", "type_id": 1, "type": "0.5mm黑色", "amount": 500, "unit": "个",
                 "price": Decimal("2.50"), "stock_id": warehouses[0].id},
                {"name": "文件夹", "type_id": 1, "type": "A4蓝色", "amount": 200, "unit": "个",
                 "price": Decimal("5.00"), "stock_id": warehouses[0].id},
                {"name": "订书机", "type_id": 1, "type": "标准型", "amount": 50, "unit": "个",
                 "price": Decimal("15.00"), "stock_id": warehouses[1].id},
                # 电子设备
                {"name": "笔记本电脑", "type_id": 2, "type": "ThinkPad E14", "amount": 8, "unit": "台",
                 "price": Decimal("5500.00"), "stock_id": warehouses[1].id},
                {"name": "打印机墨盒", "type_id": 2, "type": "HP 680", "amount": 30, "unit": "个",
                 "price": Decimal("120.00"), "stock_id": warehouses[1].id},
                {"name": "USB数据线", "type_id": 2, "type": "Type-C 1m", "amount": 100, "unit": "个",
                 "price": Decimal("15.00"), "stock_id": warehouses[2].id},
                # 清洁用品
                {"name": "洗手液", "type_id": 3, "type": "500ml", "amount": 80, "unit": "瓶",
                 "price": Decimal("18.00"), "stock_id": warehouses[2].id},
                {"name": "抽纸", "type_id": 3, "type": "200抽", "amount": 300, "unit": "包",
                 "price": Decimal("8.00"), "stock_id": warehouses[2].id},
                {"name": "垃圾袋", "type_id": 3, "type": "45x55cm", "amount": 500, "unit": "卷",
                 "price": Decimal("3.50"), "stock_id": warehouses[3].id},
                # 劳保用品
                {"name": "安全帽", "type_id": 4, "type": "ABS材质", "amount": 25, "unit": "个",
                 "price": Decimal("35.00"), "stock_id": warehouses[3].id},
                {"name": "防护手套", "type_id": 4, "type": "橡胶手套", "amount": 200, "unit": "个",
                 "price": Decimal("8.00"), "stock_id": warehouses[3].id},
                # 食品饮料
                {"name": "矿泉水", "type_id": 5, "type": "550ml", "amount": 400, "unit": "瓶",
                 "price": Decimal("2.00"), "stock_id": warehouses[4].id},
                {"name": "咖啡", "type_id": 5, "type": "速溶咖啡", "amount": 100, "unit": "包",
                 "price": Decimal("5.00"), "stock_id": warehouses[4].id},
                # 维修工具
                {"name": "螺丝刀套装", "type_id": 6, "type": "32件套", "amount": 15, "unit": "套",
                 "price": Decimal("68.00"), "stock_id": warehouses[4].id},
            ]

            for item in stock_items:
                stock = StockInfo(
                    name=item["name"],
                    type_id=item["type_id"],
                    type=item["type"],
                    amount=item["amount"],
                    unit=item["unit"],
                    price=item["price"],
                    stock_id=item["stock_id"],
                    is_in=0
                )
                db.add(stock)
            db.commit()
            print("15 stock items created")

        # ========== 6. Inbound Records ==========
        existing_put = db.query(StockPut).first()
        if not existing_put:
            stock_items = db.query(StockInfo).all()
            inbound_records = [
                {"num": "RK20260115001", "price": Decimal("6750.00"), "custodian": "张三",
                 "put_user": "admin", "content": "办公用品采购入库",
                 "create_date": datetime.now() - timedelta(days=10)},
                {"num": "RK20260117002", "price": Decimal("44000.00"), "custodian": "李四",
                 "put_user": "zhangsan", "content": "电子设备批量入库",
                 "create_date": datetime.now() - timedelta(days=8)},
                {"num": "RK20260119003", "price": Decimal("2400.00"), "custodian": "王五",
                 "put_user": "lisi", "content": "清洁用品补货",
                 "create_date": datetime.now() - timedelta(days=6)},
                {"num": "RK20260121004", "price": Decimal("1875.00"), "custodian": "赵六",
                 "put_user": "wangwu", "content": "劳保用品入库",
                 "create_date": datetime.now() - timedelta(days=4)},
                {"num": "RK20260123005", "price": Decimal("1820.00"), "custodian": "钱七",
                 "put_user": "admin", "content": "食品饮料及工具入库",
                 "create_date": datetime.now() - timedelta(days=2)},
            ]

            for record in inbound_records:
                put = StockPut(
                    num=record["num"],
                    price=record["price"],
                    custodian=record["custodian"],
                    put_user=record["put_user"],
                    content=record["content"],
                    create_date=record["create_date"]
                )
                db.add(put)
                db.flush()

                # Add goods belong records
                for stock in random.sample(stock_items, min(3, len(stock_items))):
                    belong = GoodsBelong(
                        stock_info_id=stock.id,
                        stock_put_id=put.id,
                        amount=random.randint(10, 50),
                        price=stock.price * random.randint(10, 50),
                        create_date=record["create_date"]
                    )
                    db.add(belong)

            db.commit()
            print("5 inbound records created")

        # ========== 7. Purchase Requests ==========
        existing_purchase = db.query(PurchaseRequest).first()
        if not existing_purchase:
            admin_user = db.query(User).filter(User.username == "admin").first()
            zhangsan = db.query(User).filter(User.username == "zhangsan").first()
            lisi = db.query(User).filter(User.username == "lisi").first()

            purchase_requests = [
                {"num": "PUR20260120001", "user_id": admin_user.user_id, "status": 3,
                 "total_price": Decimal("15680.00"), "content": "年度办公用品采购",
                 "create_date": datetime.now() - timedelta(days=15)},
                {"num": "PUR20260122002", "user_id": zhangsan.user_id if zhangsan else admin_user.user_id,
                 "status": 1, "total_price": Decimal("8900.00"), "content": "IT设备更新采购",
                 "create_date": datetime.now() - timedelta(days=10)},
                {"num": "PUR20260123003", "user_id": lisi.user_id if lisi else admin_user.user_id,
                 "status": 0, "total_price": Decimal("2350.00"), "content": "清洁用品补充采购",
                 "create_date": datetime.now() - timedelta(days=5)},
                {"num": "PUR20260124004", "user_id": admin_user.user_id, "status": 2,
                 "total_price": Decimal("5600.00"), "content": "劳保用品采购申请",
                 "create_date": datetime.now() - timedelta(days=3)},
                {"num": "PUR20260124005", "user_id": zhangsan.user_id if zhangsan else admin_user.user_id,
                 "status": 0, "total_price": Decimal("3200.00"), "content": "员工福利采购",
                 "create_date": datetime.now() - timedelta(days=1)},
            ]

            purchase_items_data = [
                [{"name": "A4打印纸", "type": "70g", "amount": 200, "unit": "箱", "price": Decimal("45.00")},
                 {"name": "中性笔", "type": "0.5mm", "amount": 1000, "unit": "个", "price": Decimal("2.50")},
                 {"name": "文件夹", "type": "A4", "amount": 500, "unit": "个", "price": Decimal("5.00")}],
                [{"name": "笔记本电脑", "type": "ThinkPad", "amount": 5, "unit": "台", "price": Decimal("5500.00")},
                 {"name": "显示器", "type": "24寸", "amount": 10, "unit": "台", "price": Decimal("890.00")}],
                [{"name": "洗手液", "type": "500ml", "amount": 100, "unit": "瓶", "price": Decimal("18.00")},
                 {"name": "抽纸", "type": "200抽", "amount": 500, "unit": "包", "price": Decimal("8.00")}],
                [{"name": "安全帽", "type": "ABS", "amount": 100, "unit": "个", "price": Decimal("35.00")},
                 {"name": "工作服", "type": "夏季", "amount": 50, "unit": "套", "price": Decimal("42.00")}],
                [{"name": "矿泉水", "type": "550ml", "amount": 1000, "unit": "瓶", "price": Decimal("2.00")},
                 {"name": "零食礼盒", "type": "综合", "amount": 30, "unit": "箱", "price": Decimal("68.00")}],
            ]

            for i, pr_data in enumerate(purchase_requests):
                pr = PurchaseRequest(
                    num=pr_data["num"],
                    user_id=pr_data["user_id"],
                    status=pr_data["status"],
                    total_price=pr_data["total_price"],
                    content=pr_data["content"],
                    create_date=pr_data["create_date"]
                )
                db.add(pr)
                db.flush()

                for item_data in purchase_items_data[i]:
                    item = PurchaseRequestItem(
                        purchase_request_id=pr.id,
                        name=item_data["name"],
                        type=item_data["type"],
                        amount=item_data["amount"],
                        unit=item_data["unit"],
                        price=item_data["price"]
                    )
                    db.add(item)

            db.commit()
            print("5 purchase requests created")

        # ========== 8. Goods Requests ==========
        existing_goods_req = db.query(GoodsRequest).first()
        if not existing_goods_req:
            admin_user = db.query(User).filter(User.username == "admin").first()
            zhangsan = db.query(User).filter(User.username == "zhangsan").first()
            lisi = db.query(User).filter(User.username == "lisi").first()
            stock_items = db.query(StockInfo).all()

            goods_requests = [
                {"num": "REQ20260118001", "user_id": admin_user.user_id, "status": 2,
                 "purchase_num": "PUR20260120001", "content": "部门办公用品领用",
                 "create_date": datetime.now() - timedelta(days=12)},
                {"num": "REQ20260120002", "user_id": zhangsan.user_id if zhangsan else admin_user.user_id,
                 "status": 2, "purchase_num": "", "content": "IT部门设备领用",
                 "create_date": datetime.now() - timedelta(days=8)},
                {"num": "REQ20260122003", "user_id": lisi.user_id if lisi else admin_user.user_id,
                 "status": 1, "purchase_num": "", "content": "保洁部门物资申请",
                 "create_date": datetime.now() - timedelta(days=5)},
                {"num": "REQ20260123004", "user_id": admin_user.user_id, "status": 0,
                 "purchase_num": "", "content": "会议室用品申请",
                 "create_date": datetime.now() - timedelta(days=2)},
                {"num": "REQ20260124005", "user_id": zhangsan.user_id if zhangsan else admin_user.user_id,
                 "status": 0, "purchase_num": "", "content": "新员工入职物资",
                 "create_date": datetime.now() - timedelta(days=1)},
            ]

            for gr_data in goods_requests:
                gr = GoodsRequest(
                    num=gr_data["num"],
                    user_id=gr_data["user_id"],
                    status=gr_data["status"],
                    purchase_num=gr_data["purchase_num"],
                    content=gr_data["content"],
                    create_date=gr_data["create_date"]
                )
                db.add(gr)
                db.flush()

                # Add random items from stock
                for stock in random.sample(stock_items, min(2, len(stock_items))):
                    item = GoodsRequestItem(
                        goods_request_id=gr.id,
                        stock_info_id=stock.id,
                        name=stock.name,
                        type=stock.type,
                        type_id=stock.type_id,
                        amount=random.randint(5, 20),
                        stock_amount=stock.amount,
                        unit=stock.unit,
                        price=stock.price
                    )
                    db.add(item)

            db.commit()
            print("5 goods requests created")

        # ========== 9. Bulletins ==========
        existing_bulletin = db.query(Bulletin).first()
        if not existing_bulletin:
            bulletins = [
                {"title": "系统上线公告", "content": "仓储管理系统正式上线运行，请各部门按照操作规范使用系统。如有问题请联系IT部门。",
                 "author": "系统管理员", "status": 1, "create_date": datetime.now() - timedelta(days=30)},
                {"title": "库存盘点通知", "content": "定于本月25日进行全面库存盘点，请各仓库管理员提前做好准备工作，确保账实相符。",
                 "author": "仓库主管", "status": 1, "create_date": datetime.now() - timedelta(days=15)},
                {"title": "新增物品分类说明", "content": "系统新增'劳保用品'和'食品饮料'两个物品分类，请在入库时正确选择物品类型。",
                 "author": "系统管理员", "status": 1, "create_date": datetime.now() - timedelta(days=10)},
                {"title": "春节放假安排", "content": "春节假期期间（2月10日-2月17日），仓库实行值班制度，紧急出库请提前联系值班人员。",
                 "author": "行政部", "status": 1, "create_date": datetime.now() - timedelta(days=5)},
                {"title": "采购流程优化通知", "content": "为提高采购效率，采购申请审批流程已优化。5000元以下采购由部门主管直接审批，5000元以上需总经理审批。",
                 "author": "采购部", "status": 1, "create_date": datetime.now() - timedelta(days=2)},
                {"title": "系统维护公告", "content": "系统将于本周六凌晨2:00-6:00进行例行维护，届时系统将暂停服务，请提前安排好工作。",
                 "author": "IT部门", "status": 1, "create_date": datetime.now() - timedelta(days=1)},
            ]

            for b_data in bulletins:
                bulletin = Bulletin(
                    title=b_data["title"],
                    content=b_data["content"],
                    author=b_data["author"],
                    status=b_data["status"],
                    create_date=b_data["create_date"]
                )
                db.add(bulletin)

            db.commit()
            print("6 bulletins created")

        print("\n========== Database seeding completed! ==========")
        print("Test accounts:")
        print("  - admin / admin123 (Administrator)")
        print("  - zhangsan / 123456 (Manager)")
        print("  - lisi / 123456 (Operator)")
        print("  - wangwu / 123456 (Operator)")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
