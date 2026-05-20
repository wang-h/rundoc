---
title: API 路由总览
---

# API 路由总览

记录接口、参数、兼容性与迁移说明。

## 文档站 API（计划中）

### 文档读取

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/docs/tree` | 获取完整文档树 |
| GET | `/api/docs/doc/:id` | 获取单篇文档 |
| GET | `/api/docs/search?q=` | 全文搜索 |
| GET | `/api/docs/context?path=` | 获取文档+分块上下文 |
| GET | `/api/docs/related?path=` | 获取关联文档 |

### 文档管理

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/docs/reindex` | 重建搜索索引 |

### 引擎操作

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/rundoc/scan` | 触发变更扫描 |
| POST | `/api/rundoc/write` | 触发文档更新 |
| POST | `/api/rundoc/check` | 触发一致性检查 |
| POST | `/api/rundoc/commit` | 生成提交建议 |

## 兼容性

当前为静态文档站版本，API 接口仍在规划中。上述路由设计为后续实现的目标形态。实现时应保持向后兼容，新增字段以可选方式添加。
