#!/bin/bash
# ========================================================
# 若星空间 (Starry Space) - 生产数据库自动备份脚本
# ========================================================

set -e

BACKUP_DIR="${BACKUP_DIR:-/opt/starry-space/backups}"
CONTAINER_NAME="starry_postgres"
DB_USER="${POSTGRES_USER:-starry_admin}"
DB_NAME="${POSTGRES_DB:-starry_db}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/starry_db_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=14 # 保留 14 天历史备份

# 创建备份目录
mkdir -p "${BACKUP_DIR}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始执行 PostgreSQL 数据库备份..."

# 执行 pg_dump 并 gzip 压缩
docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" "${DB_NAME}" | gzip > "${BACKUP_FILE}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 备份完成: ${BACKUP_FILE} ($(du -sh "${BACKUP_FILE}" | cut -f1))"

# 清理超过保留期限的旧备份
find "${BACKUP_DIR}" -type f -name "starry_db_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} \;

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 已清理 ${RETENTION_DAYS} 天前的旧备份文件。"
