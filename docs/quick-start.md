---
title: 快速开始
---

# 快速开始

RunDoc 的最小工作流不是先整理收件箱，而是先绑定项目并扫描变更。

## 前置要求

在开始之前，确保你的环境满足以下条件：

| 需求 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | ≥ 18.0.0 | 运行文档站构建脚本和 CLI 工具 |
| Git | ≥ 2.30 | 变更检测依赖 Git 历史 |
| npm | ≥ 9.0.0 | 包管理和脚本执行 |

**验证环境：**

```bash
node --version   # 应输出 v18.x 或更高
git --version    # 应输出 git version 2.30.x 或更高
npm --version    # 应输出 9.x 或更高
```

**支持的平台：** macOS、Linux。Windows 用户建议通过 WSL2 使用。

## 环境配置

在项目中使用 RunDoc 之前，建议先配置以下环境变量（均为可选，有合理默认值）：

```bash
# RunDoc 配置文件路径（默认为项目根目录 .rundoc/）
export RUNDOC_HOME="./.rundoc"

# AI 模型接口配置（用于影响分析和补丁生成）
export RUNDOC_AI_PROVIDER="anthropic"    # 可选：anthropic / openai
export RUNDOC_AI_MODEL="claude-sonnet-4-20250514"

# 日志级别
export RUNDOC_LOG_LEVEL="info"           # 可选：debug / info / warn / error
```

## 1. 初始化项目结构

在项目根目录准备：

```text
docs/
  00-positioning/
  01-product/
  02-business/
  03-technical/
  04-ai/
  05-decisions/
  06-ops/
  07-archive/

.rundoc/
  config.yml
  prompts/
  state/
  reports/
```

**详细步骤：**

```bash
# 在项目根目录执行初始化
cd /path/to/your-project
rundoc init
```

**init 命令会完成以下操作：**

1. 创建 `docs/` 目录及其 8 个子分区目录
2. 在每个子分区目录下放置 `.gitkeep` 和示例 `README.md`
3. 创建 `.rundoc/` 配置目录结构
4. 生成默认的 `.rundoc/config.yml` 配置文件
5. 生成默认的影响映射规则文件 `.rundoc/rules/impact-map.yml`
6. 在 `.rundoc/state/last-scan.json` 中记录当前 `HEAD` 为起始检查点

**预期输出：**

```text
✓ 文档目录结构已创建（8 个分区）
✓ 配置文件已生成：.rundoc/config.yml
✓ 影响规则已生成：.rundoc/rules/impact-map.yml
✓ 初始扫描点已记录：last_scan.json
初始化完成。下一步：rundoc scan
```

## 2. 运行命令闭环

```bash
rundoc init
rundoc scan
rundoc write
rundoc check
rundoc commit
```

- `scan`: 从 `last_commit..HEAD` 生成变更影响报告
- `write`: 更新受影响 Markdown 文档
- `check`: 检查冲突/缺失/过期
- `commit`: 生成可审阅提交

**各命令详细说明与预期输出：**

### rundoc scan

```bash
rundoc scan
```

**执行内容：** 扫描自上次记录以来的所有 Git 变更，分析影响域，生成影响映射。

**预期输出：**

```text
🔍 扫描区间：a1b2c3d..e5f6g7h
   发现 3 个文件变更：
   - backend/routes/quotes.py (added)
   - backend/models/quote.py (added)
   - frontend/src/views/Quotes.vue (added)

📊 影响分析完成：
   - 技术文档（03-technical）：2 个文档目标，置信度 0.89
   - 产品文档（01-product）：1 个文档目标，置信度 0.85

📄 报告已保存：.rundoc/reports/2026-05-20-run.md
下一步：rundoc write
```

### rundoc write

```bash
rundoc write
```

**执行内容：** 读取最近的扫描结果，为每个文档目标生成 Markdown 补丁。默认为干运行模式，不直接写文件。使用 `--apply` 参数可直接写入。

**预期输出：**

```text
✏️  生成文档补丁...

   1. docs/03-technical/api-routes.md (update)
      摘要：新增 GET /api/quotes 和 POST /api/quotes 路由说明
      置信度：0.89

   2. docs/01-product/page-specs.md (update)
      摘要：新增报价页面功能说明
      置信度：0.85

   3. docs/03-technical/data-models.md (create)
      摘要：新增 Quote 数据模型说明

⚠️  此为干运行模式。所有补丁未写入文件。
   使用 rundoc write --apply 应用补丁。
```

### rundoc check

```bash
rundoc check
```

**执行内容：** 检查当前文档站的一致性，包括死链接、过期引用、哈希不匹配。

**预期输出：**

```text
✅ 检查完成：
   错误：0
   警告：2
   提示：5

   警告：
   - docs/03-technical/api-routes.md：引用的源码路径 backend/routes/old.py 不存在
   - docs/06-ops/deployment.md：文档哈希不匹配，可能已被外部修改

   提示：
   - 3 篇文档缺少交叉引用链接
   - 2 篇文档的 updatedAt 超过 90 天
```

### rundoc commit

```bash
rundoc commit
```

**执行内容：** 将已审核通过的补丁提交到新分支，生成 PR 描述和运行报告。

**预期输出：**

```text
📦 创建分支：rundoc/2026-05-20-sync
   提交：e7f8g9h - docs: 同步 2026-05-20 项目变更

   受影响文档：
   - docs/03-technical/api-routes.md (update)
   - docs/01-product/page-specs.md (update)
   - docs/03-technical/data-models.md (create)

📄 运行报告：.rundoc/reports/2026-05-20-run.md
🔗 创建 Pull Request：https://github.com/your-org/your-project/pull/42
```

## 3. 报告产物

每次扫描应产出运行报告：

```text
.rundoc/reports/YYYY-MM-DD-run.md
```

报告至少包含：

- 本次项目变化摘要
- 受影响文档清单
- 建议更新项
- 未决冲突与人工确认点

**完整的报告示例：**

```markdown
# RunDoc 运行报告 — 2026-05-20

## 变更摘要
- 区间：a1b2c3d → e5f6g7h
- 变更文件：3 个（2 added, 0 modified, 0 deleted）
- 提交信息：feat: add quote generation module

## 受影响文档（3 个）

| 文档 | 类型 | 置信度 |
|------|------|--------|
| docs/03-technical/api-routes.md | update | 0.89 |
| docs/01-product/page-specs.md | update | 0.85 |
| docs/03-technical/data-models.md | create | 0.72 |

## 人工确认点
- [ ] data-models.md 为新建议文档，是否确认创建？
- [ ] Quotes.vue 页面变更是否需要更新截屏？

## 冲突
（无）
```

## 4. 文档站本地开发（可选）

当前仓库包含文档站 UI，可用于浏览 `docs/`：

```bash
npm install
npm run build
npm run dev
```

**详细说明：**

- `npm install`：安装文档站所需的依赖（React、构建工具等）
- `npm run build`：执行 `scripts/build-docs.mjs` 构建脚本，将 `docs/` 中的 Markdown 编译为 TypeScript 内容模块和搜索索引
- `npm run dev`：启动本地开发服务器（默认 `http://localhost:3000`），支持热重载

**开发服务器启动后的预期输出：**

```text
  > dev
  > vite

  VITE v5.x  ready in 320 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

打开浏览器访问 `http://localhost:3000` 即可浏览文档站。

## 验证安装

运行以下命令确认 RunDoc 环境正常工作：

```bash
# 1. 验证 CLI 可用
rundoc --version

# 2. 验证项目初始化状态
ls .rundoc/config.yml && echo "✓ 配置存在" || echo "✗ 未初始化，请运行 rundoc init"
ls docs/00-positioning/ && echo "✓ 文档目录存在" || echo "✗ 文档目录不存在"

# 3. 执行一次扫描测试（需要有待扫描的提交）
rundoc scan --dry-run

# 4. 验证文档站构建
npm run build && echo "✓ 文档站构建成功" || echo "✗ 构建失败，检查 Node.js 版本"
```

## 常见问题

### `rundoc: command not found`

**原因：** RunDoc CLI 未安装或未加入 PATH。

**解决方法：**

```bash
npm install -g rundoc-cli
# 或者
npx rundoc scan
```

### 扫描提示"无变更"

**原因：** `.rundoc/state/last-scan.json` 中记录的 `last_commit` 与当前 `HEAD` 相同。

**解决方法：** 进行一次新的代码提交后重新扫描，或使用 `--base` 参数手动指定基准提交：

```bash
rundoc scan --base HEAD~3
```

### 文档站构建失败：`npm run build` 报错

**原因：** 通常是 Node.js 版本不满足要求（需要 ≥ 18）。

**解决方法：**

```bash
node --version  # 确认版本
nvm install 18  # 如使用 nvm，安装 Node 18
nvm use 18
npm install
npm run build
```

### 补丁内容不准确

**原因：** 影响分析基于预定义规则，默认规则可能不完全匹配你的项目结构。

**解决方法：** 编辑 `.rundoc/rules/impact-map.yml`，添加项目特有的路径映射规则。若使用 AI 模型生成补丁，检查 `RUNDOC_AI_MODEL` 环境变量配置。

### 文档哈希不匹配警告

**原因：** 文档文件在 RunDoc 外部被手动修改。

**解决方法：** 运行 `npm run build` 重新生成文档站，哈希将自动更新。若持续出现，检查是否有其他工具（如编辑器自动格式化）在修改文件。

## 5. 启动后端服务器

RunDoc 提供了完整的后端 API 服务，用于项目管理、文档存储和版本历史：

```bash
cd server
npm install
npm run dev
```

**预期输出：**

```text
Running database migrations...
  ✓ Migration "0001_create_projects" executed successfully
  ✓ Migration "0002_create_documents" executed successfully
Migrations complete.
RunDoc Server running on http://localhost:3191
```

**关键说明：**
- 服务默认监听端口 `3191`（可通过 `PORT` 环境变量修改）
- 启动时自动执行数据库迁移，创建 `rundoc.db` SQLite 数据库文件
- 数据库路径默认为 `server/rundoc.db`，可通过 `DATABASE_PATH` 环境变量自定义
- 健康检查：`curl http://localhost:3191/health`

## 6. 通过 API 创建项目与文档

### 创建第一个项目

```bash
curl -X POST http://localhost:3191/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "My Project",
    "slug_id": "my-project",
    "description": "A sample project for testing",
    "git_repo_url": "https://github.com/example/my-project"
  }'
```

### 创建文档

```bash
curl -X POST http://localhost:3191/api/projects/my-project/docs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "Getting Started",
    "content": "# Getting Started\n\nWelcome to My Project!\n\n## Installation\n\n```bash\nnpm install\n```"
  }'
```

### 查看文档列表

```bash
curl http://localhost:3191/api/projects/my-project/docs \
  -H "Authorization: Bearer <your-token>"
```

### 更新文档（自动保存版本快照）

```bash
curl -X PUT http://localhost:3191/api/projects/my-project/docs/<doc-id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "title": "Getting Started (Updated)",
    "content": "# Getting Started\n\nUpdated content...",
    "change_summary": "Updated installation steps"
  }'
```

每次更新文档时，系统自动将当前版本保存到 `document_history` 表，形成完整的版本历史。可通过以下接口查看：

```bash
curl http://localhost:3191/api/projects/my-project/docs/<doc-id>/history \
  -H "Authorization: Bearer <your-token>"
```

## 7. 通过 UI 管理项目与文档

除了 API，RunDoc 前端提供了完整的管理界面：

1. **访问首页** → 点击进入 `/projects` 项目列表
2. **创建项目** → 点击"New Project"按钮，填写项目名称、描述和 Git 仓库地址
3. **进入项目** → 点击项目卡片，进入项目详情页，查看文档树
4. **创建文档** → 在项目详情页点击"New Doc"，填写标题和内容
5. **编辑文档** → 在文档阅读页点击"Edit"，使用 TipTap 3 编辑器进行所见即所得编辑
6. **查看历史** → 文档页面展示所有历史版本，支持查看变更摘要

## 8. 前端 Mock 模式

前端在无法连接后端时自动降级为 Mock 模式，使用内置的示例数据：

**Mock 数据来源：** `src/utils/mock-data.ts`

**降级逻辑：**
- 页面加载时尝试调用 `/api/me` 获取用户信息
- 若后端不可达，API 调用自动回退到 mock 数据
- Mock 数据包含 4 个示例项目（RunDoc、RunOS API、Editor Markdown、RunOS CLI）和对应的文档及版本历史

**何时使用 Mock 模式：**
- 前端独立开发，无需启动后端
- 快速体验和演示 UI 功能
- 后端部署前的前端功能验证

**启动前端开发服务器：**

```bash
# 在项目根目录
npm install
npm run dev
```

访问 `http://localhost:3000`，前端将自动检测后端状态并选择数据源。

## 9. 完整开发环境搭建

同时运行前端和后端以获得完整体验：

```bash
# 终端 1：启动后端
cd server
npm install
npm run dev

# 终端 2：启动前端
npm install
npm run dev
```

前端默认通过 Vite 代理将 `/api` 请求转发到后端，配置见 `vite.config.ts`。

## 下一步

完成快速开始后，建议按以下顺序深入了解 RunDoc：

| 文档 | 说明 |
|------|------|
| [架构设计](/docs/architecture) | 了解引擎的多层设计和处理管线 |
| [内容模型](/docs/reference/content-model) | 理解数据模型的字段和关系 |
| [API 约定](/docs/ai/api-contract) | 了解 API 接口设计 |
| [影响映射规则](/docs/03-technical/impact-rules) | 自定义你的项目变更感知规则 |
| [设计原则](/docs/ai/design-principles) | 了解 RunDoc 的核心设计理念 |
| [路线图](/docs/reference/roadmap) | 查看未来功能规划 |

## 推荐工作流

1. 将 `rundoc scan` 加入 CI 流水线，每次提交自动检测文档影响
2. 在团队 Code Review 流程中加入"文档同步检查"卡点
3. 定期运行 `rundoc check` 清理过期引用和死链接
4. 扩展 `.rundoc/rules/impact-map.yml` 适配项目特有的文件结构
5. 使用项目维度的文档管理组织团队知识库
6. 通过文档编辑器和版本历史进行协作编辑
