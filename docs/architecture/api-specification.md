# API 规范

## 1. 基础信息

- **Base URL**: `/api/v1`
- **认证**: Bearer Token (JWT)
- **内容类型**: `application/json`

## 2. 响应格式

### 成功响应
```json
{
  "code": 0,
  "msg": "success",
  "data": { ... }
}
```

### 分页响应
```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "records": [...],
    "total": 100,
    "size": 10,
    "current": 1,
    "pages": 10
  }
}
```

### 错误响应
```json
{
  "code": 500,
  "msg": "Error message",
  "data": null
}
```

## 3. API 端点

### 3.1 认证模块

#### 登录
```
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=admin&password=admin123

Response:
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expire_time": "2024-01-01 12:00:00",
    "roles": ["ADMIN"],
    "user": {...}
  }
}
```

#### 获取当前用户
```
GET /auth/me
Authorization: Bearer <token>

Response:
{
  "code": 0,
  "data": {
    "user_id": 1,
    "username": "admin",
    "roles": ["ADMIN"],
    ...
  }
}
```

### 3.2 仓库管理

#### 获取仓库列表
```
GET /warehouses?page=1&size=10&name=xxx

Response:
{
  "code": 0,
  "data": {
    "records": [...],
    "total": 50,
    ...
  }
}
```

#### 创建仓库
```
POST /warehouses
{
  "name": "主仓库",
  "principal": "张三",
  "contact": "13800138000",
  "address": "北京市"
}
```

### 3.3 入库管理

#### 获取入库列表
```
GET /inbound?page=1&size=10
```

#### 创建入库
```
POST /inbound
{
  "stock_id": 1,
  "custodian": "张三",
  "put_user": "李四",
  "content": "备注",
  "items": [
    {
      "name": "物品A",
      "type": "型号1",
      "type_id": 1,
      "amount": 100,
      "unit": "个",
      "price": 10.00
    }
  ]
}
```

#### Excel 导入
```
POST /inbound/import
Content-Type: multipart/form-data

file: <Excel文件>
stock_id: 1
custodian: 张三
put_user: 李四
```

### 3.4 库存管理

#### 获取库存列表
```
GET /stock?page=1&size=10&name=xxx&type_id=1&stock_id=1
```

#### 获取出入库明细
```
GET /stock/detail?page=1&size=10&is_in=1
```

### 3.5 仪表盘

#### 获取综合统计
```
GET /dashboard/board

Response:
{
  "code": 0,
  "data": {
    "overview": {
      "inbound_count": 100,
      "month_inbound_count": 10,
      "total_consumption": 50000
    },
    "daily_inbound": [...],
    "daily_outbound": [...],
    "inbound_by_type": [...],
    "outbound_by_type": [...],
    "low_stock": [...]
  }
}
```

## 4. 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

## 5. 通用参数

### 分页参数
- `page`: 页码，默认 1
- `size`: 每页数量，默认 10，最大 100

### 排序参数
- `sort`: 排序字段
- `order`: 排序方向 (asc/desc)
