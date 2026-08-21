# 若星空间 (Starry Space) 生产部署与商用运维指南

本文档指导若星空间项目在云服务器（如腾讯云 CVM / 阿里云 ECS）上的生产环境部署、容器编排、数据库安全备份、HTTPS/SSL 证书配置以及微信支付商户号对接。

---

## 1. 架构拓扑与环境要求

### 1.1 硬件推荐配置
- **CPU**: 2 核及以上（推荐 4 核）
- **内存**: 4 GB 及以上（推荐 8 GB）
- **磁盘**: 系统盘 50 GB + 数据盘 100 GB SSD
- **操作系统**: Ubuntu 22.04 LTS / Debian 12 / CentOS Stream 9
- **网络**: 5 Mbps 基础公网带宽，备案独立主域名（如 `starry.space`）

### 1.2 必备基础环境
- **Docker Engine**: `>= 24.0.0`
- **Docker Compose**: `>= 2.20.0`
- **Node.js**: `20 LTS`（若在宿主机直接跑构建）
- **Git**: 最新版

---

## 2. 生产目录与配置文件编排

```text
/opt/starry-space/
├── docker-compose.yml        # Docker Compose 生产三容器编排
├── .env.production           # 生产环境变量（严禁提交至 Git）
├── certs/                    # 微信支付 V3 私钥证书与 API 证书
│   └── apiclient_key.pem
├── nginx/                    # 宿主机或 Nginx 容器 SSL 证书
│   ├── starry.space.crt
│   └── starry.space.key
├── backups/                  # 数据库自动备份持久化目录
└── uploads/                  # 学员打卡与物料上传文件卷
```

### 2.1 生产环境变量 (`.env.production`) 示例

```ini
NODE_ENV=production
PORT=3000

# 生产数据库连接 (容器内部网络连接 postgres)
POSTGRES_USER=starry_admin
POSTGRES_PASSWORD=YOUR_STRONG_RANDOM_PASSWORD_64CHARS
POSTGRES_DB=starry_db
DATABASE_URL=postgresql://starry_admin:YOUR_STRONG_RANDOM_PASSWORD_64CHARS@postgres:5432/starry_db?schema=public

# JWT 鉴权密钥 (请使用 64 位强随机字符串)
JWT_CLIENT_SECRET=YOUR_SECURE_CLIENT_JWT_SECRET_KEY
JWT_CLIENT_EXPIRES_IN=7d
JWT_ADMIN_SECRET=YOUR_SECURE_ADMIN_JWT_SECRET_KEY
JWT_ADMIN_EXPIRES_IN=1d

# 微信小程序凭证
WECHAT_MINI_APP_ID=wx_prod_real_appid
WECHAT_MINI_APP_SECRET=YOUR_REAL_APP_SECRET_32CHARS

# 微信支付 V3 直连商户号配置
WECHAT_PAY_MCH_ID=1900000000
WECHAT_PAY_SERIAL_NO=YOUR_CERT_SERIAL_NUMBER
WECHAT_PAY_PRIVATE_KEY_PATH=/app/certs/apiclient_key.pem
WECHAT_PAY_API_V3_KEY=YOUR_API_V3_KEY_32CHARS
WECHAT_PAY_NOTIFY_URL=https://api.starry.space/api/v1/payments/wechat/notify

# 文件存储驱动 (本地 / 腾讯云 COS)
STORAGE_DRIVER=local
UPLOAD_DIR=/app/uploads
BASE_URL=https://admin.starry.space
```

---

## 3. 一键部署与数据库迁移

### 3.1 拉取代码与配置初始化
```bash
cd /opt/starry-space
git clone <YOUR_GIT_REPO_URL> .
cp .env.example .env.production
# 编辑 .env.production 填入真实生产凭证
```

### 3.2 容器一键构建与启动
```bash
# 一键拉起 PostgreSQL 16、Node.js 后端与 Admin/Nginx 前端
docker compose --env-file .env.production up -d --build
```

### 3.3 执行 Prisma 生产数据库 Migration 与初始种子
```bash
# 在 server 容器中执行数据库迁移
docker compose exec server npx prisma migrate deploy
docker compose exec server npm run prisma:seed
```

---

## 4. HTTPS / SSL 证书配置 (Let's Encrypt / 腾讯云 SSL)

在生产部署中，微信小程序 API 必须强制要求 `HTTPS` 协议。

### Nginx SSL 配置模板 (`/etc/nginx/conf.d/starry.conf`)：
```nginx
server {
    listen 80;
    server_name api.starry.space admin.starry.space;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.starry.space;

    ssl_certificate /etc/nginx/certs/starry.space.crt;
    ssl_certificate_key /etc/nginx/certs/starry.space.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 5. 数据库自动定时备份策略

我们已提供自动化定时备份脚本 [`scripts/backup_db.sh`](file:///Users/apple/Repo/dev/starry/mini2/scripts/backup_db.sh)。

### 设置 Crontab 每天凌晨 3:00 自动备份：
```bash
chmod +x /opt/starry-space/scripts/backup_db.sh
crontab -e
# 添加以下行：
0 3 * * * /opt/starry-space/scripts/backup_db.sh >> /var/log/starry_backup.log 2>&1
```

---

## 6. 商用上线前最终 Checklist

- [ ] **数据库凭证**：已修改默认密码，生产数据库仅允许内网/容器间互联；
- [ ] **微信公众平台配置**：
  - [ ] 服务器域名已添加 `request合法域名`（如 `https://api.starry.space`）；
  - [ ] 上传业务域名已添加 `uploadFile合法域名`；
- [ ] **微信支付 V3**：
  - [ ] 已在微信支付商户后台配置 `APIv3密钥`；
  - [ ] 已下载 `apiclient_key.pem` 并挂载至 `server/certs/`；
  - [ ] 支付回调地址与商户公网域名保持一致；
- [ ] **管理员初始账号**：已登录 Admin 后台修改 `admin` 默认登密；
- [ ] **服务健康监控**：`https://api.starry.space/api/health` 正常返回 `healthy`。
