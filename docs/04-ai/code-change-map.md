---
title: 代码变更映射
---

# 代码变更映射

维护"代码变更 -> 文档影响"的映射规则，使扫描引擎能自动判断哪些文档需要更新。

## 映射规则

### 前端代码（`frontend/`、`src/`、`components/`）

- 页面组件变更 → `docs/01-product/page-specs.md`
- 路由变更 → `docs/03-technical/api-routes.md`
- UI 组件库变更 → `docs/01-product/page-specs.md`

### 后端代码（`backend/`、`api/`、`routes/`）

- API 接口变更 → `docs/03-technical/api-routes.md`
- 数据模型变更 → `docs/03-technical/api-routes.md`
- 业务逻辑变更 → `docs/02-business/process-notes.md`

### 基础设施（`docker-compose.yml`、`Dockerfile`、`deploy/`）

- 部署配置变更 → `docs/06-ops/deployment.md`

### 数据层（`migrations/`、`schema.sql`、`models/`）

- 数据库结构变更 → `docs/03-technical/api-routes.md`
- 数据模型变更 → 可能影响 `docs/02-business/process-notes.md`

## 自定义规则

可在 `.rundoc/config.yml` 中添加自定义映射：

```yaml
impact_rules:
  - pattern: "pricing/**"
    target_docs:
      - "docs/02-business/process-notes.md"
    domain: business
```
