---
title: 部署与运维
---

# 部署与运维

记录部署配置、运维流程与回滚路径。

## 部署方式

当前文档站为纯静态站点，部署方式灵活：

- **静态托管**：构建产物 `dist/` 可部署到 Nginx、GitHub Pages、Cloudflare Pages 等
- **容器化**：提供 Dockerfile，支持 Docker 部署
- **Node 服务**：`npm run preview` 可快速启动本地预览服务

## 构建命令

```bash
npm install          # 安装依赖
npm run build        # 构建文档站与搜索索引
npm run dev          # 启动开发服务器
```

## 运维关注点

- 文档源文件变更后需重新构建，刷新搜索索引
- `.rundoc/state/` 目录保存扫描状态，部署时需保留
- `.rundoc/reports/` 目录保存运行报告，建议纳入备份

## 回滚路径

- 文档站构建产物可通过 Git 回滚到上一个稳定版本
- 搜索索引与文档内容一致性由构建脚本保证
- 建议在部署前运行 `rundoc check` 检查冲突
