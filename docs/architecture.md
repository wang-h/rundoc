---
title: 架构
---

# 架构

RunDoc 分为两层：项目变更引擎（核心）和文档站渲染层（当前已实现）。

## 1) 项目观察引擎（核心）

```text
Git / Repo State
  -> Detect（差异 / 提交 / MR）
  -> Understand（影响分析）
  -> Map（文档目标）
  -> Patch（Markdown 更新）
  -> Commit（可审阅变更）
```

### 发现变化（Detect）

读取 `last_commit..HEAD` 的变更，覆盖代码、配置、数据库脚本、部署脚本与 `docs/` 自身变化。

**详细流程：**

1. 从 `.rundoc/state/last-scan.json` 读取 `last_commit`（首次运行时使用仓库初始提交）
2. 执行 `git diff --name-status last_commit..HEAD` 获取变更文件列表
3. 将变更文件按类型分组：`added` / `modified` / `deleted` / `renamed`
4. 过滤仅关注以下路径模式：
   - 源代码：`backend/**`、`frontend/**`、`src/**`
   - 配置与基础设施：`*.yml`、`*.yaml`、`Dockerfile`、`docker-compose*`
   - 数据库：`migrations/**`、`*.sql`、`schema.*`
   - 文档自身：`docs/**`
5. 收集区间内所有提交信息（`git log last_commit..HEAD --oneline`）作为语义上下文

**关键决策点：** 如果没有检测到任何变更，引擎提前终止并记录"无变更"状态。

### 理解影响（Understand）

基于路径、提交语义和规则判断变更影响域，例如：

- `frontend/**` 影响产品页面文档
- `backend/**` 影响 API/技术文档
- `schema.sql` 影响数据模型文档
- `docker-compose.yml` 影响部署运维文档

**详细流程：**

1. **路径规则匹配（确定性层）**：基于预定义规则表（见 `.rundoc/rules/impact-map.yml`）对每条变更路径进行精确匹配
2. **提交语义分析（语义层）**：解析 `commit_messages`，通过关键词检测补充影响域（如 `feat:` → 产品域，`perf:` → 技术域）
3. **影响评分**：综合路径匹配权重（0.7）和语义权重（0.3）计算 `confidence`
4. **去重与合并**：同一文档目标被多条影响指向时合并为一条，取最高置信度
5. **低置信标记**：`confidence < 0.6` 的影响条目自动设置 `needs_human_review = true`

**可扩展性：** 影响规则存储在独立的 `.rundoc/rules/impact-map.yml` 中，团队可自定义规则以适配自身项目结构。

### 映射文档（Map）

将影响域映射到文档目标路径（优先更新已有文档），并生成待修改清单。

**详细流程：**

1. 读取当前文档树（`docs/` 目录结构）
2. 根据影响域匹配目标分区：
   - `product` → `docs/01-product/`
   - `technical` → `docs/03-technical/`
   - `ai` → `docs/04-ai/`
   - `ops` → `docs/06-ops/`
   - `business` → `docs/02-business/`
   - `decisions` → `docs/05-decisions/`
3. 在目标分区内查找与变更路径最相关的已有文档（基于路径和文件名相似度）
4. 若已有文档匹配，生成 `update` 类型补丁目标；若无匹配，建议 `create` 类型并提示创建新文档
5. 生成最终的影响映射列表

**冲突检测：** 如果多条变更指向同一文档目标的同一段落，标记为潜在冲突。

### 生成补丁（Patch）

对目标 Markdown 生成最小补丁，不重写整篇文档。

**详细流程：**

1. 对于每条影响映射，读取目标文档的当前内容
2. 定位目标文档中与变更相关的段落（基于标题匹配和内容相似度）
3. 调用 AI 模型生成最小化的 Markdown 插入/修改建议
4. 生成 unified diff 格式的补丁预览
5. 对需要人工审核的补丁，附加审核提示和上下文链接

**补丁原则：**
- 只修改与变更直接相关的段落，不触碰其他内容
- 保留原始 Markdown 格式和缩进风格
- 添加 `<!-- rundoc: generated -->` 注释标记由引擎生成的内容

### 提交审阅（Commit）

输出可审阅的分支、提交与报告，不直接跳过人工审核。

**详细流程：**

1. 将所有已生成的补丁写入新的 Git 分支（命名格式：`rundoc/YYYY-MM-DD-sync`）
2. 生成 `.rundoc/reports/YYYY-MM-DD-run.md` 运行报告
3. 生成 Pull Request 描述，包含：
   - 变更摘要
   - 受影响文档清单
   - 每个补丁的置信度和人工审核建议
   - 冲突和待办事项列表
4. 更新 `.rundoc/state/last-scan.json` 中的 `last_commit`

**人工卡点：** 所有补丁必须先经过 PR 审核流程，不自动合并到主分支。

## 两层架构设计理由

```text
┌─────────────────────────────────────┐
│         文档站渲染层（只读快照）       │
│   docs/*.md → build → React App     │
│   关注：文档站现在长什么样             │
├─────────────────────────────────────┤
│       项目变更引擎（读写感知）         │
│   Git Diff → Analysis → Patches     │
│   关注：文档站应该如何演化             │
└─────────────────────────────────────┘
```

**为什么要分两层？**

1. **独立演化**：渲染层可以独立升级技术栈（如从 React 迁移到 VitePress），不影响变更引擎。变更引擎的分析能力可以独立升级（如从规则匹配升级到 LLM），不影响站点渲染。

2. **职责清晰**：渲染层是"一次构建，静态输出"的只读系统。变更引擎是"持续感知，增量更新"的读写系统。合在一起会导致复杂的依赖关系和难以调试的边界情况。

3. **部署独立**：渲染层适合部署为 CDN 静态站点。变更引擎适合部署为 CI/CD 流水线中的一个 Job。两者有不同的扩缩和监控需求。

4. **数据桥接**：两层通过文件系统（`docs/` 目录和 `.rundoc/` 状态目录）通信，而非 API 调用。变更引擎写完文件，渲染层构建时读取，两者解耦且不互相阻塞。

## 完整流程示例

### 场景：开发者新增了报价功能

**输入：** 一次推送包含 3 个文件变更：
```
backend/routes/quotes.py      (新增)
backend/models/quote.py       (新增)
frontend/src/views/Quotes.vue (新增)
```

**Detect 阶段输出：**
```json
{
  "changes": [
    { "path": "backend/routes/quotes.py", "type": "added" },
    { "path": "backend/models/quote.py", "type": "added" },
    { "path": "frontend/src/views/Quotes.vue", "type": "added" }
  ],
  "commit_messages": ["feat: add quote generation module"]
}
```

**Understand 阶段输出：**
- `backend/routes/quotes.py` → 规则匹配 `backend/**` → 影响域 `technical`，权重 0.9
- `backend/models/quote.py` → 规则匹配 `backend/**` → 影响域 `technical`，权重 0.9
- `frontend/src/views/Quotes.vue` → 规则匹配 `frontend/**` → 影响域 `product`，权重 0.85
- 提交语义 `feat: add quote` → 补充影响域 `product`，权重 0.3

**Map 阶段输出：**
- `technical` 域 → 已有文档 `docs/03-technical/api-routes.md`，匹配相似度 0.72
- `product` 域 → 已有文档 `docs/01-product/page-specs.md`，匹配相似度 0.68
- 建议新建 `docs/03-technical/data-models.md`，匹配相似度 0.45（低于阈值）

**Patch 阶段输出：**
- `docs/03-technical/api-routes.md`：插入 Quotes API 路由说明
- `docs/01-product/page-specs.md`：更新页面规范，添加报价页面条目
- 两者均为 `update` 类型

**Commit 阶段输出：**
- 创建分支 `rundoc/2026-05-20-sync`
- 生成 PR 标题：`docs: 同步报价功能相关的文档变更`
- 报告路径：`.rundoc/reports/2026-05-20-run.md`

## 扩展点与自定义

团队可以在以下点位扩展引擎行为：

| 扩展点 | 位置 | 说明 |
|------|------|------|
| 影响规则 | `.rundoc/rules/impact-map.yml` | 自定义路径模式与影响域的映射关系 |
| AI 提示词 | `.rundoc/prompts/` | 自定义影响分析和补丁生成的提示词模板 |
| 忽略规则 | `.rundocignore` | 类似 `.gitignore`，排除不需要文档感知的路径 |
| 自定义影响域 | `.rundoc/config.yml` | 在六个预定义域之外增加团队专属的影响域分类 |
| 补丁后处理 | `.rundoc/scripts/post-patch.sh` | 补丁生成后自动执行的脚本（如格式校验、拼写检查） |

## 文档站渲染层（当前已实现）

```text
docs/**/*.md
  -> scripts/build-docs.mjs
  -> src/content/docs-content.ts
  -> src/content/search-index.json
  -> React 文档应用
```

渲染层负责阅读体验（导航、搜索、目录），不负责变更感知。

**构建管线详解：**

1. **扫描阶段**（`scripts/build-docs.mjs`）：遍历 `docs/` 目录，解析每个 Markdown 文件，提取 frontmatter、标题树、内容分块、交叉引用链接
2. **内容生成**（`src/content/docs-content.ts`）：将解析结果序列化为 TypeScript 模块，供 React 应用直接导入
3. **搜索索引**（`src/content/search-index.json`）：生成全文搜索所需的倒排索引，在客户端执行搜索
4. **React 渲染**：文档应用读取生成的内容模块和索引导出，渲染完整的文档站点

**构建触发方式：**
- 本地开发：`npm run dev`（热重载）
- 生产构建：`npm run build`（静态输出到 `dist/`）
- CI 触发：未来可与 RunDoc 引擎结合，在补丁应用后自动触发重新构建
