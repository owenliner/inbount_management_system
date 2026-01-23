# 商品入库管理系统

基于 Python FastAPI + React 的现代化仓储管理系统，用于管理商品入库、库存跟踪和采购流程。

## 技术栈

### 后端
- **Python 3.11+** - 编程语言
- **FastAPI** - Web 框架
- **SQLAlchemy 2.0** - ORM
- **Alembic** - 数据库迁移
- **PostgreSQL** - 数据库
- **Redis** - 缓存
- **JWT** - 认证

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Ant Design 5** - UI 组件库
- **Zustand** - 状态管理
- **React Query** - 数据获取
- **Recharts** - 图表
- **Tailwind CSS** - 样式

## 功能特性

- **用户认证** - JWT 登录/登出
- **仪表盘** - 统计数据、图表、公告
- **库房管理** - 仓库信息 CRUD
- **入库管理** - 入库单创建、Excel 导入
- **库存管理** - 库存列表、出入库明细
- **基础数据** - 物品类型、计量单位管理
- **采购流程** - 采购申请、物品审批
- **公告管理** - 系统公告

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

# 安装依赖 (使用 Poetry)
poetry install

# 创建数据库
createdb inbound_management

# 运行迁移
alembic upgrade head

# 启动开发服务器
poetry run uvicorn app.main:app --reload
```

#### 前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 项目结构

```
inbound_management_system/
├── README.md                 # 项目说明
├── docker-compose.yml        # Docker 编排
├── .env.example              # 环境变量示例
├── docs/                     # 文档
│   ├── architecture/         # 架构文档
│   └── deployment/           # 部署文档
├── backend/                  # FastAPI 后端
│   ├── pyproject.toml        # Python 依赖
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
    └── src/
        ├── api/              # API 客户端
        ├── components/       # 组件
        ├── pages/            # 页面
        ├── store/            # 状态管理
        └── routes/           # 路由配置
```

## API 文档

启动后端服务后，访问以下地址查看 API 文档：

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc

## 数据库设计

详见 [数据库设计文档](docs/architecture/database-design.md)

## 部署指南

详见 [部署文档](docs/deployment/deployment-guide.md)

## 默认账号

- 用户名: `admin`
- 密码: `admin123`

## License

MIT
