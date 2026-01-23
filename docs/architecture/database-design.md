# 数据库设计

## 1. ER 图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│ user_roles  │>────│    roles    │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              │
                                        ┌─────────────┐
                                        │ role_menus  │
                                        └─────────────┘
                                              │
                                              │
                                        ┌─────────────┐
                                        │    menus    │
                                        └─────────────┘

┌─────────────┐     ┌─────────────┐
│ storehouses │<────│ stock_info  │
└─────────────┘     └─────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
              ┌─────────┐ ┌─────────┐
              │stock_put│ │stock_out│
              └─────────┘ └─────────┘
                    │           │
              ┌─────────────────┐
              │  goods_belong   │
              └─────────────────┘

┌─────────────────┐     ┌─────────────────────┐
│ consumable_types│<────│     stock_info      │
└─────────────────┘     └─────────────────────┘

┌─────────────────┐     ┌─────────────────────────┐
│purchase_requests│<────│purchase_request_items   │
└─────────────────┘     └─────────────────────────┘

┌─────────────────┐     ┌─────────────────────────┐
│ goods_requests  │<────│  goods_request_items    │
└─────────────────┘     └─────────────────────────┘
```

## 2. 表结构

### 2.1 用户模块

#### users (用户表)
| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | BIGINT PK | 用户ID |
| username | VARCHAR(50) | 用户名 |
| password | VARCHAR(128) | 密码哈希 |
| email | VARCHAR(128) | 邮箱 |
| mobile | VARCHAR(20) | 手机号 |
| status | CHAR(1) | 状态: 1正常, 0锁定 |
| ssex | CHAR(1) | 性别: 0男, 1女, 2未知 |
| avatar | VARCHAR(255) | 头像 |
| create_time | TIMESTAMP | 创建时间 |
| last_login_time | TIMESTAMP | 最后登录 |

#### roles (角色表)
| 字段 | 类型 | 说明 |
|------|------|------|
| role_id | BIGINT PK | 角色ID |
| role_name | VARCHAR(50) | 角色名称 |
| remark | VARCHAR(255) | 备注 |
| create_time | TIMESTAMP | 创建时间 |

### 2.2 仓库模块

#### storehouses (仓库表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 仓库ID |
| code | VARCHAR(50) | 仓库编号 |
| name | VARCHAR(100) | 仓库名称 |
| principal | VARCHAR(50) | 负责人 |
| contact | VARCHAR(50) | 联系方式 |
| address | VARCHAR(255) | 地址 |
| create_date | TIMESTAMP | 创建时间 |

#### consumable_types (物品类型表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 类型ID |
| name | VARCHAR(100) | 类型名称 |
| code | VARCHAR(50) | 类型编码 |
| remark | TEXT | 备注 |
| create_date | TIMESTAMP | 创建时间 |

#### units (计量单位表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 单位ID |
| name | VARCHAR(50) | 单位名称 |
| remark | TEXT | 备注 |
| create_date | TIMESTAMP | 创建时间 |

### 2.3 库存模块

#### stock_info (库存信息表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 库存ID |
| name | VARCHAR(200) | 物品名称 |
| type_id | INT FK | 类型ID |
| type | VARCHAR(100) | 型号规格 |
| amount | INT | 数量 |
| unit | VARCHAR(50) | 单位 |
| price | DECIMAL(10,2) | 单价 |
| is_in | INT | 状态: 0库存, 1入库, 2出库 |
| stock_id | INT FK | 仓库ID |
| create_date | TIMESTAMP | 创建时间 |

#### stock_put (入库记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 入库ID |
| num | VARCHAR(50) | 入库单号 |
| price | DECIMAL(10,2) | 总金额 |
| custodian | VARCHAR(50) | 保管人 |
| put_user | VARCHAR(50) | 入库人 |
| content | TEXT | 备注 |
| create_date | TIMESTAMP | 入库时间 |

#### stock_out (出库记录表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 出库ID |
| num | VARCHAR(50) | 出库单号 |
| price | DECIMAL(10,2) | 总金额 |
| custodian | VARCHAR(50) | 保管人 |
| out_user | VARCHAR(50) | 出库人 |
| receive_user | VARCHAR(50) | 接收人 |
| create_date | TIMESTAMP | 出库时间 |

### 2.4 请求模块

#### purchase_requests (采购申请表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 申请ID |
| num | VARCHAR(50) | 申请单号 |
| user_id | INT FK | 申请人ID |
| content | TEXT | 备注 |
| status | INT | 状态: 0待审,1通过,2拒绝,3完成 |
| total_price | DECIMAL(10,2) | 总金额 |
| create_date | TIMESTAMP | 申请时间 |
| approve_date | TIMESTAMP | 审批时间 |

#### goods_requests (物品申请表)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK | 申请ID |
| num | VARCHAR(50) | 申请单号 |
| purchase_num | VARCHAR(50) | 关联采购单 |
| user_id | INT FK | 申请人ID |
| content | TEXT | 备注 |
| status | INT | 状态: 0提交,1审核,2通过,3驳回 |
| create_date | TIMESTAMP | 申请时间 |
| approve_date | TIMESTAMP | 审批时间 |

## 3. 索引设计

```sql
-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- 库存表索引
CREATE INDEX idx_stock_info_name ON stock_info(name);
CREATE INDEX idx_stock_info_is_in ON stock_info(is_in);
CREATE INDEX idx_stock_info_stock_id ON stock_info(stock_id);
CREATE INDEX idx_stock_info_type_id ON stock_info(type_id);

-- 入库表索引
CREATE INDEX idx_stock_put_num ON stock_put(num);
CREATE INDEX idx_stock_put_create_date ON stock_put(create_date);
```
