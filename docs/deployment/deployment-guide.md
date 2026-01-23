# 部署指南

## 1. 环境要求

### 1.1 硬件要求
- CPU: 2 核以上
- 内存: 4GB 以上
- 硬盘: 20GB 以上

### 1.2 软件要求
- Docker 20.10+
- Docker Compose 2.0+
- 或者:
  - Python 3.11+
  - Node.js 18+
  - PostgreSQL 14+
  - Redis 7+

## 2. Docker 部署（推荐）

### 2.1 准备配置文件

```bash
# 复制环境配置
cp .env.example .env

# 编辑配置
vim .env
```

### 2.2 配置说明

```bash
# 数据库配置
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_strong_password  # 修改为强密码
POSTGRES_DB=inbound_management

# 应用配置
SECRET_KEY=your_super_secret_key_change_in_production  # 修改为随机字符串
DEBUG=false
```

### 2.3 启动服务

```bash
# 构建并启动
docker-compose up -d --build

# 查看日志
docker-compose logs -f

# 查看状态
docker-compose ps
```

### 2.4 初始化数据

```bash
# 进入后端容器
docker-compose exec backend bash

# 运行数据库迁移
alembic upgrade head

# 创建管理员用户（可选）
python -c "
from app.database import SessionLocal
from app.services.user_service import UserService
from app.schemas.user import UserCreate

db = SessionLocal()
user = UserCreate(
    username='admin',
    password='admin123',
    email='admin@example.com',
    role_ids=[]
)
UserService.create(db, user)
print('Admin user created')
"
```

## 3. 手动部署

### 3.1 后端部署

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate

# 安装依赖
pip install poetry
poetry install

# 设置环境变量
export DATABASE_URL=postgresql://user:pass@localhost:5432/inbound_management
export REDIS_URL=redis://localhost:6379/0
export SECRET_KEY=your_secret_key

# 运行迁移
alembic upgrade head

# 启动服务
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3.2 前端部署

```bash
cd frontend

# 安装依赖
npm install

# 构建
npm run build

# 部署到 Nginx
cp -r dist/* /usr/share/nginx/html/
```

### 3.3 Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 4. 生产环境配置

### 4.1 使用 Gunicorn

```bash
pip install gunicorn

gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000
```

### 4.2 使用 Systemd

```ini
# /etc/systemd/system/inbound-backend.service
[Unit]
Description=Inbound Management Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/inbound/backend
ExecStart=/opt/inbound/backend/venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable inbound-backend
systemctl start inbound-backend
```

## 5. 备份策略

### 5.1 数据库备份

```bash
# 备份
pg_dump -U postgres inbound_management > backup_$(date +%Y%m%d).sql

# 恢复
psql -U postgres inbound_management < backup_20240101.sql
```

### 5.2 自动备份脚本

```bash
#!/bin/bash
# /opt/backup.sh

BACKUP_DIR=/opt/backups
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份
docker-compose exec -T postgres pg_dump -U postgres inbound_management > $BACKUP_DIR/db_$DATE.sql

# 保留最近7天
find $BACKUP_DIR -name "db_*.sql" -mtime +7 -delete
```

## 6. 监控

### 6.1 健康检查

```bash
# 后端健康检查
curl http://localhost:8000/health

# 数据库连接检查
curl http://localhost:8000/api/v1/dashboard/overview
```

### 6.2 日志查看

```bash
# Docker 日志
docker-compose logs -f backend

# 系统日志
journalctl -u inbound-backend -f
```

## 7. 故障排除

### 7.1 常见问题

**Q: 数据库连接失败**
```bash
# 检查数据库状态
docker-compose exec postgres pg_isready

# 检查连接字符串
echo $DATABASE_URL
```

**Q: 前端无法访问 API**
```bash
# 检查 CORS 配置
# 检查 Nginx 代理配置
```

**Q: 内存不足**
```bash
# 增加 Docker 内存限制
# 或减少 worker 数量
```
