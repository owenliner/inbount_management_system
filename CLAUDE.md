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
│   │   ├── main.py         # 应用入口 (含静态文件服务)
│   │   ├── config.py       # 配置管理 (含 DESKTOP_MODE)
│   │   ├── database.py     # 数据库连接
│   │   ├── api/v1/         # API 路由
│   │   │   ├── auth.py     # 认证
│   │   │   ├── users.py    # 用户管理
│   │   │   ├── warehouses.py # 仓库管理
│   │   │   ├── stock.py    # 库存管理
│   │   │   ├── inbound.py  # 入库管理
│   │   │   ├── purchase_requests.py # 采购申请
│   │   │   ├── goods_requests.py    # 物品审批
│   │   │   ├── bulletins.py # 公告管理
│   │   │   └── dashboard.py # 仪表盘
│   │   ├── models/         # SQLAlchemy 模型
│   │   │   ├── user.py     # User, Role, UserRole
│   │   │   ├── warehouse.py # Storehouse, ConsumableType, Unit
│   │   │   ├── stock.py    # StockInfo, StockPut, StockOut, GoodsBelong
│   │   │   ├── request.py  # PurchaseRequest, GoodsRequest
│   │   │   └── bulletin.py # Bulletin
│   │   ├── schemas/        # Pydantic 模式
│   │   ├── services/       # 业务逻辑
│   │   └── core/           # 核心模块 (安全、依赖)
│   ├── alembic/            # 数据库迁移
│   ├── seed_data.py        # 测试数据脚本
│   ├── desktop_app.py      # 桌面应用入口 (PyWebView)
│   ├── desktop.spec        # PyInstaller 打包配置
│   ├── venv/               # Python 虚拟环境
│   └── inbound_management.db  # SQLite 数据库文件
├── frontend/               # React 前端
│   ├── src/
│   │   ├── api/           # API 客户端 (axios)
│   │   ├── components/    # 通用组件
│   │   │   ├── Search/    # 全局搜索
│   │   │   └── Notification/ # 通知下拉
│   │   ├── pages/         # 页面组件
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Warehouses.tsx
│   │   │   ├── Inbound/
│   │   │   ├── Stock/
│   │   │   ├── ConsumableTypes.tsx
│   │   │   ├── Units.tsx
│   │   │   ├── PurchaseRequests.tsx
│   │   │   ├── GoodsRequests.tsx
│   │   │   ├── Bulletins.tsx
│   │   │   ├── Users.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── Profile.tsx
│   │   ├── store/         # Zustand 状态管理
│   │   └── routes/        # 路由配置
│   ├── TEST_REPORT.md     # Playwright 测试报告
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

# 重置数据库并初始化测试数据
rm inbound_management.db && python seed_data.py
```

### 前端
```bash
cd frontend
npm run dev      # 开发服务器 (localhost:5173)
npm run build    # 生产构建
npm run lint     # 代码检查
```

### 桌面应用
```bash
cd backend

# 安装桌面依赖
pip install pywebview pyinstaller "bcrypt<5"

# 开发模式运行 (不打包)
python desktop_app.py

# 打包
pyinstaller desktop.spec

# 运行打包后的应用
open dist/InboundManagement.app  # macOS
# dist\InboundManagement\InboundManagement.exe  # Windows
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
| stock_info | 库存主表 (is_in: 0=库存, 1=入库中, 2=出库中) |
| stock_put | 入库记录 |
| stock_out | 出库记录 (预留) |
| goods_belong | 入库/出库明细 |
| purchase_requests | 采购申请 |
| purchase_request_items | 采购申请明细 |
| goods_requests | 物品审批 |
| goods_request_items | 物品审批明细 |
| bulletins | 公告信息 |

## 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | ADMIN (管理员) |
| zhangsan | 123456 | MANAGER (经理) |
| lisi | 123456 | OPERATOR (操作员) |
| wangwu | 123456 | OPERATOR (操作员) |

## 测试数据

运行 `python seed_data.py` 会创建：
- 5 个库房
- 6 个物品类型
- 8 个计量单位
- 15 个库存物品
- 5 个入库记录
- 5 个采购申请 (不同状态)
- 5 个物品审批 (不同状态)
- 6 个公告

## 功能模块状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 登录/认证 | ✅ 完成 | JWT 认证 |
| 仪表盘 | ✅ 完成 | 统计、图表、公告、预警 |
| 库房管理 | ✅ 完成 | CRUD |
| 入库管理 | ✅ 完成 | 创建、列表、详情 |
| 库存管理 | ✅ 完成 | 列表、明细 |
| 物品类型 | ✅ 完成 | CRUD |
| 计量单位 | ✅ 完成 | CRUD |
| 采购申请 | ✅ 完成 | CRUD、审批状态 |
| 物品审批 | ✅ 完成 | CRUD、审批状态 |
| 公告管理 | ✅ 完成 | CRUD |
| 用户管理 | ✅ 完成 | 列表、删除 |
| 系统设置 | ✅ 完成 | 通知、显示、库存设置 |
| 个人信息 | ✅ 完成 | 资料查看、密码修改 |
| 全局搜索 | ✅ 完成 | 搜索库存和仓库 |
| 通知下拉 | ✅ 完成 | 显示最新公告 |
| 桌面应用 | ✅ 完成 | PyWebView + PyInstaller (Win/Mac) |

## 注意事项

1. 前端 API 请求使用 `@/api` 目录下的封装方法
2. 状态管理使用 Zustand (`@/store`)
3. 数据获取使用 TanStack Query
4. UI 组件优先使用 Ant Design 5
5. 样式优先使用 Tailwind CSS
6. 所有颜色使用设计系统定义的变量
7. 出库功能已预留数据结构，待后续开发

## 桌面应用架构

### 技术方案
- **PyWebView** — 使用系统原生 WebView 显示前端，体积小 (~40MB)
- **PyInstaller** — 打包 Python + 前端为单一可执行文件
- **GitHub Actions** — 自动构建 Windows (.exe) 和 macOS (.app)

### 关键文件
| 文件 | 说明 |
|------|------|
| `backend/desktop_app.py` | 桌面入口：启动 uvicorn + pywebview 窗口 |
| `backend/desktop.spec` | PyInstaller 打包配置 |
| `backend/app/config.py` | `DESKTOP_MODE` 配置，控制数据库路径 |
| `backend/app/main.py` | 静态文件服务 + SPA fallback |
| `.github/workflows/build-desktop.yml` | CI/CD 构建流程 |

### 桌面模式数据库路径
- **Windows**: `%APPDATA%\InboundManagement\inbound_management.db`
- **macOS**: `~/Library/Application Support/InboundManagement/inbound_management.db`
- **Linux**: `~/.local/share/InboundManagement/inbound_management.db`

### macOS 运行问题
下载的 .app 首次运行会提示"已损坏"，需执行：
```bash
xattr -cr /path/to/InboundManagement.app
```

## 已知问题

- Ant Design 废弃 API 警告 (`dropdownRender`, `addonAfter`) - 不影响功能
- React Router Future Flag 警告 - 不影响功能
- passlib 与 bcrypt 5.x 不兼容，需使用 `bcrypt<5`
