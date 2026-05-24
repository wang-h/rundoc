---
title: 部署与运维
---

# 部署与运维

记录部署配置、运维流程与回滚路径。

## 部署方式

RunDoc 由两部分组成：**API 服务端**（Node.js + SQLite）和**前端 SPA**（React + Vite）。部署时需要同时启动两者。

### 整体架构

```text
客户端请求 → Nginx（反向代理）
              ├── /api/*  → Node.js 服务端（端口 3191）
              └── /*      → 前端静态文件（dist/）
```

### 静态文档站部署

文档站为纯静态站点，部署方式灵活：

- **静态托管**：构建产物 `dist/` 可部署到 Nginx、GitHub Pages、Cloudflare Pages 等
- **容器化**：提供 Dockerfile，支持 Docker 部署
- **Node 服务**：`npm run preview` 可快速启动本地预览服务

### API 服务端部署

服务端使用 Node.js + Kysely + better-sqlite3，负责文档 CRUD、版本管理和项目绑定。

**环境要求**：

- Node.js >= 18
- 文件系统写入权限（SQLite 数据库文件）

**安装与启动**：

```bash
cd server
npm install                    # 安装服务端依赖
npm run dev                    # 启动开发服务器（端口 3191，自动执行数据库迁移）
```

**生产环境启动**：

```bash
cd server
npm start                      # 启动生产服务器（自动执行数据库迁移）
```

### 容器化部署

项目根目录提供 `Dockerfile` 和 `nginx.conf`，支持一键构建：

```bash
docker build -t rundoc .
docker run -d -p 80:80 -v rundoc-data:/app/server/data rundoc
```

容器内 Nginx 自动将 `/api/` 请求代理到 Node.js 服务端，其余请求由前端静态文件响应。

## 构建命令

```bash
# 前端
npm install          # 安装依赖
npm run build        # 构建前端 SPA 与搜索索引
npm run dev          # 启动前端开发服务器

# 服务端
cd server
npm install          # 安装服务端依赖
npm run build        # 构建 TypeScript
npm run dev          # 启动服务端开发服务器
npm start            # 启动服务端生产服务器
```

## 数据库

RunDoc 使用 SQLite 作为数据存储（通过 Kysely 查询构建器 + better-sqlite3 驱动）。

### 数据库文件

- **位置**：`rundoc.db`（项目根目录，可通过环境变量 `DATABASE_PATH` 配置）
- **格式**：SQLite 3 单文件数据库，启用 WAL 模式
- **备份建议**：将 `rundoc.db` 文件纳入定期备份

### 数据库迁移

数据库 schema 通过 Kysely 迁移脚本管理，位于 `server/src/database/migrations/` 目录。

**迁移自动执行：** 服务启动时调用 `migrateToLatest()`，自动执行所有未应用的迁移，无需手动干预。启动日志中会显示每条迁移的执行状态：

```text
Running database migrations...
  ✓ Migration "0001_create_projects" executed successfully
  ✓ Migration "0002_create_documents" executed successfully
Migrations complete.
```

**迁移文件命名**：`NNNN_description.ts`（序号前缀），例如 `0001_create_projects.ts`。

迁移脚本示例：

```typescript
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('projects')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text')
    .addColumn('git_repo_url', 'text')
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('active'))
    .addColumn('created_at', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updated_at', 'text', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('projects').execute()
}
```

### 环境变量

服务端通过 `.env` 文件配置，支持以下变量：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3191` | API 服务监听端口 |
| `DATABASE_PATH` | `rundoc.db`（项目根目录） | SQLite 数据库文件路径 |
| `NODE_ENV` | `development` | 运行环境（development / production） |

## 运维关注点

- **文档源文件**：变更后需重新构建，刷新搜索索引
- **数据库文件**：`rundoc.db` 包含所有项目和文档数据，启动时自动执行迁移
- **数据库备份**：SQLite 单文件数据库，备份只需复制 `rundoc.db` 文件。建议每日定时备份
- **数据库迁移**：服务启动时自动执行，每次升级前建议先在备份数据库上验证
- **状态目录**：`.rundoc/state/` 保存文档扫描状态，部署时需保留
- **报告目录**：`.rundoc/reports/` 保存运行报告，建议纳入备份
- **日志**：服务端日志输出到 stdout，建议通过 systemd 或 Docker 日志驱动收集

## 回滚路径

- 文档站构建产物可通过 Git 回滚到上一个稳定版本
- 搜索索引与文档内容一致性由构建脚本保证
- 建议在部署前运行 `rundoc check` 检查冲突
