# CLAUDE.md - 项目上下文

## 项目概述

这是一个商品入库管理系统，采用前后端分离架构：
- **后端**: Python FastAPI + SQLAlchemy + SQLite/PostgreSQL
- **前端**: React 18 + TypeScript + Ant Design 5 + Tailwind CSS

## 目录结构

```
inbound_management_system/
├── backend/                 # FastAPI 后端
│   ├── app/
│   │   ├── main.py         # 应用入口
│   │   ├── config.py       # 配置管理
│   │   ├── database.py     # 数据库连接
│   │   ├── api/v1/         # API 路由
│   │   ├── models/         # SQLAlchemy 模型
│   │   ├── schemas/        # Pydantic 模式
│   │   ├── services/       # 业务逻辑
│   │   └── core/           # 核心模块 (安全、依赖)
│   ├── alembic/            # 数据库迁移
│   ├── venv/               # Python 虚拟环境
│   └── inbound_management.db  # SQLite 数据库文件
├── frontend/               # React 前端
│   ├── src/
│   │   ├── api/           # API 客户端 (axios)
│   │   ├── components/    # 通用组件
│   │   ├── pages/         # 页面组件
│   │   ├── store/         # Zustand 状态管理
│   │   └── routes/        # 路由配置
│   ├── index.html
│   └── vite.config.ts
└── material_cos/           # 旧版 Java 系统 (参考)
```

## 常用命令

### 后端
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### 前端
```bash
cd frontend
npm run dev      # 开发服务器 (localhost:5173)
npm run build    # 生产构建
npm run lint     # 代码检查
```

## 设计系统 (BankDash)

### 颜色
- Primary: `#1814F3`
- Secondary: `#343C6A`
- Accent Blue: `#396AFF`, `#2D60FF`
- Cyan: `#16DBCC`
- Orange: `#FFBB38`
- Red: `#FE5C73`
- Text Primary: `#232323`
- Text Secondary: `#718EBF`
- Text Disabled: `#B1B1B1`
- Background: `#F5F7FA`
- Card: `#FFFFFF`
- Border: `#E6EFF5`

### 组件样式
- 卡片圆角: `25px`
- 按钮圆角: `12px`
- 输入框圆角: `12px`
- 阴影: `0px 4px 20px rgba(0, 0, 0, 0.02)`

### 侧边栏
- 固定宽度: `250px`
- 白色背景
- 活动指示器: 左侧 5px 蓝色条 (`#2D60FF`)
- 活动文字: `#1814F3`
- 非活动文字: `#B1B1B1`

## API 响应格式

```typescript
interface ApiResponse<T> {
  code: number;    // 0 = 成功
  msg: string;
  data: T;
}
```

## 认证

- 使用 JWT Token
- Token 存储在 localStorage
- 请求头: `Authorization: Bearer <token>`

## 数据库表

| 表名 | 用途 |
|------|------|
| users | 用户账户 |
| roles / user_roles | 角色权限 |
| storehouses | 仓库信息 |
| consumable_types | 物品分类 |
| units | 计量单位 |
| stock_info | 库存主表 |
| stock_put | 入库记录 |
| stock_out | 出库记录 |
| bulletins | 公告信息 |

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## 注意事项

1. 前端 API 请求使用 `@/api` 目录下的封装方法
2. 状态管理使用 Zustand (`@/store`)
3. 数据获取使用 TanStack Query
4. UI 组件优先使用 Ant Design 5
5. 样式优先使用 Tailwind CSS
6. 所有颜色使用设计系统定义的变量
