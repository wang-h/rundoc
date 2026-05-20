---
title: 组织导航
---

# 组织导航

RunDoc 的侧边栏导航通过国际化配置文件集中管理。当前导航配置定义在 `src/locales/zh-CN.json` 和 `src/locales/en-US.json` 的 `nav.sections` 字段中。

## 基本结构

每个导航分组（section）包含一个标题和一组导航项：

```json
{
  "title": "AI 原生",
  "items": [
    { "title": "AI 设计原则", "path": "/docs/ai/design-principles", "label": "原则" },
    { "title": "API 约定", "path": "/docs/ai/api-contract", "label": "接口" }
  ]
}
```

每个导航项包含三个字段：

| 字段 | 说明 |
|------|------|
| `title` | 导航项的显示标题 |
| `path` | 目标文档的路由路径 |
| `label` | 短标签（可选，用于移动端或紧凑布局） |

## 路由规则

Markdown 文件按文件路径自动映射为文档路由：

```text
docs/overview.md              → /docs/overview
docs/ai/api-contract.md       → /docs/ai/api-contract
docs/guide/writing-docs.md    → /docs/guide/writing-docs
docs/02-business/process-notes.md  → /docs/02-business/process-notes
```

路由 `/` 保留给首页。

### 路由与导航的关系

- 导航中声明的 `path` 必须指向实际存在的文档路由，否则链接会 404。
- 不在导航中的文档仍然可以通过 URL 直接访问——导航只控制"可见性"，不控制"可访问性"。
- 同一个文档可以出现在多个分组中（例如一个核心文档可以同时出现在"开始"和"参考"分组）。

## 导航组织模式

根据团队规模和文档数量，可以选择不同的导航组织方式。

### 平铺模式（适合文档量较小）

所有分组平铺在顶层，每个分组 2-5 个文档。适合总文档量在 30 篇以内的团队。

```json
{ "title": "概览", "items": [...] },
{ "title": "规范", "items": [...] },
{ "title": "指南", "items": [...] },
{ "title": "参考", "items": [...] }
```

### 嵌套模式（适合中型文档库）

用分组名表达层级关系，例如：

```json
{ "title": "产品", "items": [
    { "title": "PRD 规范", "path": "/docs/product/prd-spec" },
    { "title": "SOP 模板", "path": "/docs/product/sop-template" }
]},
{ "title": "工程", "items": [
    { "title": "API 设计规范", "path": "/docs/eng/api-design" },
    { "title": "代码审查流程", "path": "/docs/eng/code-review" }
]},
{ "title": "运维", "items": [
    { "title": "部署流程", "path": "/docs/ops/deployment" },
    { "title": "故障响应", "path": "/docs/ops/incident-response" }
]}
```

### 角色导向模式（适合跨职能团队）

按读者角色组织，让每个角色快速找到相关文档：

```json
{ "title": "产品经理", "items": [
    { "title": "需求文档模板", "path": "/docs/pm/prd-template" },
    { "title": "竞品分析框架", "path": "/docs/pm/competitive-analysis" }
]},
{ "title": "后端工程师", "items": [
    { "title": "数据库设计规范", "path": "/docs/backend/db-design" },
    { "title": "API 开发指南", "path": "/docs/backend/api-guide" }
]},
{ "title": "前端工程师", "items": [
    { "title": "组件库使用指南", "path": "/docs/frontend/components" },
    { "title": "样式规范", "path": "/docs/frontend/styling" }
]}
```

角色导向模式的优势：
- 新人按自己的角色进入，不需要理解整个文档结构
- 每个角色只看自己关心的内容，减少认知负担
- 当团队成员角色变化时，自然接触新角色的文档集

## 按读者类型组织章节

一个好的导航应该回答不同读者的问题：

### 新人（第一天）
需要回答：这个项目是什么？我从哪里开始？
- 导航路径：概览 → 快速开始 → 架构
- 分组建议：放在第一个分组，标题用"开始"或"入门"

### 日常使用者（每天）
需要回答：某个规则是什么？这个流程怎么做？
- 导航路径：按领域分组（产品/工程/运维）
- 分组建议：按工作流程排序，把最常用的放在上面

### 决策者（需要时）
需要回答：当前状态是什么？哪里有问题？
- 导航路径：项目观察 → 决策记录 → 路线图
- 分组建议：暴露项目状态信息，让决策者快速了解全局

### AI Agent（程序化读取）
需要回答：文档结构是什么？内容怎么引用？
- 读取路径：通过结构化接口（tree、doc、search）而非导航
- 建议：保持导航结构稳定，AI 可以用它构建内容地图

## 添加新导航项

添加新导航项需要三步：

### 1. 创建 Markdown 文件

在 `docs/` 目录下的合适位置创建新的 `.md` 文件。确保文件路径能表达内容的归属关系。

### 2. 添加导航配置

在 `zh-CN.json` 和 `en-US.json` 中同步添加导航项：

```json
// zh-CN.json - nav.sections 中合适的分组
{ "title": "新文档标题", "path": "/docs/guide/new-doc", "label": "缩写" }

// en-US.json - 对应位置
{ "title": "New Doc", "path": "/docs/guide/new-doc", "label": "New" }
```

### 3. 验证

启动开发服务器，检查：
- 侧边栏是否出现新导航项
- 点击是否正常跳转
- 中英文切换后导航项是否正确显示

## 国际化导航配置

RunDoc 使用两份独立的 locale 文件分别维护中文和英文导航。两份文件的结构必须完全一致——相同的分组顺序、相同的 `path` 值——只有 `title` 和 `label` 的值可以不同。

### 同步规则

- **分组数量和顺序必须一致**：`zh-CN.json` 和 `en-US.json` 中的 `nav.sections` 数组长度必须相同，分组顺序必须对应。
- **每个分组内的 items 数量和顺序必须一致**：path 值必须一一对应。
- **path 值必须完全相同**：因为路由路径是语言无关的。
- **title 和 label 可以不同**：这是需要翻译的部分。

### 配置检查清单

修改导航配置后，检查以下项：

- [ ] 两个 locale 文件的 nav.sections 数组长度一致
- [ ] 每个分组的 items 数量在两个文件中一致
- [ ] 所有 path 值在两个文件中完全相同
- [ ] 中文 title/label 使用简体中文
- [ ] 英文 title/label 语法和拼写正确
- [ ] 所有 path 指向的文档实际存在
- [ ] 新增的文档已正确创建 Markdown 文件

## 常用场景

### 添加新章节

当文档量增长到需要新分组时：

1. 在两个 locale 文件中同时添加新的分组对象
2. 将相关文档的导航项移到新分组
3. 确保分组标题能清晰表达该组文档的共同主题

### 重新排序

直接调整数组中分组或 items 的顺序即可。侧边栏会按配置顺序渲染。

### 隐藏文档

如果某篇文档需要保留（可能被其他文档引用），但不想在导航中显示，直接从 items 中移除即可。文档路由仍然可访问。

### 临时文档入口

对于短期有效的文档（如某个版本的发布说明），可以在导航中添加但配上明显的标记，版本结束后从导航移除：

```json
{ "title": "v2.0 升级指南", "path": "/docs/releases/v2-upgrade", "label": "v2.0" }
```

## 文件组织建议

虽然导航是集中配置的，但文档文件本身的目录组织仍然很重要：

- `docs/guide/` — 使用指南类文档
- `docs/reference/` — API 参考和规范
- `docs/00-xxx/` — 观察类文档，按领域编号前缀分组
- `docs/ai/` — AI 原生设计相关文档

好的目录结构让文件查找更容易，也是合理导航设计的基础。
