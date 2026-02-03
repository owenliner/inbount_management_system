# 商品入库管理系统

基于 Python FastAPI + React 的现代化仓储管理系统，用于管理商品入库、库存跟踪和采购流程。

**支持 Web 版和桌面版 (Windows/macOS)**

[![Build Desktop App](https://github.com/owenliner/inbount_management_system/actions/workflows/build-desktop.yml/badge.svg)](https://github.com/owenliner/inbount_management_system/actions/workflows/build-desktop.yml)

## 下载桌面版

从 [GitHub Releases](https://github.com/owenliner/inbount_management_system/releases) 下载最新版本：

| 平台 | 下载 | 说明 |
|------|------|------|
| **Windows** | `InboundManagement-windows.zip` | 解压后运行 `InboundManagement.exe` |
| **macOS** | `InboundManagement-macos.zip` | 解压后运行 `InboundManagement.app` |

### macOS 首次运行

macOS 可能提示"已损坏"，需要在终端执行：

```bash
xattr -cr /path/to/InboundManagement.app
```

### Windows 首次运行

如果弹出"Windows 已保护你的电脑"，点击"更多信息" → "仍要运行"。

## 界面预览

系统采用 BankDash UI Kit 设计风格，界面简洁现代。

**主要特点：**
- 白色侧边栏 + 蓝色活动指示器
- 圆角卡片设计
- Inter 字体
- 响应式布局

## 技术栈

### 后端
- **Python 3.11+** - 编程语言
- **FastAPI** - Web 框架
- **SQLAlchemy 2.0** - ORM
- **Alembic** - 数据库迁移
- **SQLite / PostgreSQL** - 数据库 (开发环境使用 SQLite)
- **JWT** - 认证 (python-jose + passlib)

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Ant Design 5** - UI 组件库
- **Zustand** - 状态管理
- **TanStack Query** - 数据获取
- **Recharts** - 图表
- **Tailwind CSS** - 样式

### 设计系统
- **UI 参考**: [BankDash UI Kit](https://www.figma.com/design/0BbiIDxkjPvPWZnsOxAcG0/BankDash)
- **主色调**: `#1814F3` (Primary), `#396AFF` (Secondary)
- **文字颜色**: `#232323` (主要), `#718EBF` (次要), `#B1B1B1` (禁用)
- **背景色**: `#F5F7FA` (页面), `#FFFFFF` (卡片)
- **边框色**: `#E6EFF5`

## 功能模块

| 模块 | 功能描述 |
|------|----------|
| **仪表盘** | 统计数据、图表、公告、库存预警 |
| **库房管理** | 仓库信息 CRUD |
| **入库管理** | 入库单创建、详情查看 |
| **库存管理** | 库存列表、出入库明细 |
| **物品类型** | 物品分类管理 |
| **计量单位** | 单位管理 |
| **采购申请** | 采购申请、审批流程 |
| **物品审批** | 物品领用审批 |
| **公告管理** | 系统公告发布 |
| **用户管理** | 用户账户管理 |
| **系统设置** | 通知、显示、库存设置 |
| **个人信息** | 个人资料、密码修改 |

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 克隆项目
git clone <repository-url>
cd inbound_management_system

# 复制环境配置
cp .env.example .env

# 启动所有服务
docker-compose up -d

# 访问应用
# 前端: http://localhost:3000
# 后端 API: http://localhost:8000/api/v1/docs
```

### 本地开发

#### 后端

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 安装依赖
pip install -e .

# 运行迁移 (自动创建 SQLite 数据库)
alembic upgrade head

# 初始化种子数据
python seed_data.py

# 启动开发服务器
uvicorn app.main:app --reload --port 8000
```

#### 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 快速启动脚本

```bash
# 后端 (终端 1)
cd backend && source venv/bin/activate && uvicorn app.main:app --reload

# 前端 (终端 2)
cd frontend && npm run dev
```

## 项目结构

```
inbound_management_system/
├── README.md                 # 项目说明
├── CLAUDE.md                 # Claude 上下文
├── docker-compose.yml        # Docker 编排
├── .env.example              # 环境变量示例
├── docs/                     # 文档
│   ├── architecture/         # 架构文档
│   └── deployment/           # 部署文档
├── backend/                  # FastAPI 后端
│   ├── pyproject.toml        # Python 依赖
│   ├── seed_data.py          # 测试数据脚本
│   ├── alembic/              # 数据库迁移
│   └── app/
│       ├── main.py           # 应用入口
│       ├── config.py         # 配置
│       ├── database.py       # 数据库连接
│       ├── api/v1/           # API 路由
│       ├── models/           # 数据模型
│       ├── schemas/          # Pydantic 模式
│       ├── services/         # 业务逻辑
│       └── core/             # 核心模块
└── frontend/                 # React 前端
    ├── package.json          # Node 依赖
    ├── vite.config.ts        # Vite 配置
    ├── TEST_REPORT.md        # 测试报告
    └── src/
        ├── api/              # API 客户端
        ├── components/       # 组件
        ├── pages/            # 页面
        ├── store/            # 状态管理
        └── routes/           # 路由配置
```

## API 端点

### 认证
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/auth/me` - 获取当前用户信息

### 仪表盘
- `GET /api/v1/dashboard/board` - 获取统计数据

### 仓库管理
- `GET/POST /api/v1/warehouses` - 仓库列表/创建
- `GET/PUT/DELETE /api/v1/warehouses/{id}` - 仓库详情/更新/删除

### 入库管理
- `GET/POST /api/v1/inbound` - 入库列表/创建
- `GET /api/v1/inbound/{id}` - 入库详情

### 库存管理
- `GET /api/v1/stock` - 库存列表
- `GET /api/v1/stock/detail` - 出入库明细

### 基础数据
- `CRUD /api/v1/consumable-types` - 物品分类
- `CRUD /api/v1/units` - 计量单位
- `CRUD /api/v1/bulletins` - 公告管理

### 采购流程
- `CRUD /api/v1/purchase-requests` - 采购申请
- `CRUD /api/v1/goods-requests` - 物品审批

### 用户管理
- `CRUD /api/v1/users` - 用户管理

## 测试账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin123 | ADMIN | 系统管理员 |
| zhangsan | 123456 | MANAGER | 仓库经理 |
| lisi | 123456 | OPERATOR | 操作员 |
| wangwu | 123456 | OPERATOR | 操作员 |

## 测试数据

运行 `python seed_data.py` 后会生成以下测试数据：

| 模块 | 数量 | 示例 |
|------|------|------|
| 库房 | 5 | 主仓库、东区仓库、西区仓库、南区仓库、备用仓库 |
| 物品类型 | 6 | 办公用品、电子设备、清洁用品、劳保用品、食品饮料、维修工具 |
| 计量单位 | 8 | 个、箱、包、瓶、台、套、卷、把 |
| 库存物品 | 15 | A4打印纸、中性笔、笔记本电脑、洗手液等 |
| 入库记录 | 5 | 不同时间、不同操作员的入库单 |
| 采购申请 | 5 | 待审核、已通过、已拒绝、已完成等状态 |
| 物品审批 | 5 | 已提交、正在审核、审核通过等状态 |
| 公告 | 6 | 系统上线、库存盘点、春节放假等公告 |

## 桌面应用开发

桌面版使用 PyWebView + PyInstaller 打包，将 FastAPI 后端和 React 前端打包为单一可执行文件。

### 本地构建

```bash
# 1. 构建前端
cd frontend && npm run build

# 2. 安装桌面依赖
cd ../backend
pip install pywebview pyinstaller "bcrypt<5"

# 3. 打包
pyinstaller desktop.spec

# 4. 运行
# macOS
open dist/InboundManagement.app
# Windows
dist\InboundManagement\InboundManagement.exe
```

### 桌面版特性

- **单文件部署** — 无需安装 Python/Node.js 环境
- **原生窗口** — 使用系统 WebView，体积小 (~40MB)
- **自动初始化** — 首次运行自动创建数据库和测试数据
- **数据隔离** — 数据库存储在用户目录：
  - Windows: `%APPDATA%\InboundManagement\`
  - macOS: `~/Library/Application Support/InboundManagement/`
  - Linux: `~/.local/share/InboundManagement/`

## 数据库设计

详见 [数据库设计文档](docs/architecture/database-design.md)

## 部署指南

详见 [部署文档](docs/deployment/deployment-guide.md)

## License

MIT
