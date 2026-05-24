# RunDoc in RunOS

RunDoc 是 RunOS 的正式知识资产引擎。

它解决的问题不是“写文档”，而是：

```text
正式知识是否存在
文档是否跟得上项目变化
哪些段落过期
哪些决策还没写入文档
哪些 SOP 可以固化
AI 能不能稳定引用组织知识
```

## 1. RunDoc 的 RunOS 职责

RunDoc 负责已经沉淀、可长期引用、需要版本和负责人维护的正式内容：

```text
产品文档
技术文档
接口说明
SOP
制度流程
架构说明
决策文档
AI 上下文文档
验收清单
Prompt 模板
腾讯生态接入规范
企业微信通道 SOP
小程序架构
微信支付流程
腾讯云资源访问规范
```

RunDoc 不负责：

```text
临时会议记录
普通工作汇报
任务状态
阻塞和验收
还没定稿的想法
业务订单状态
```

## 2. 与 RunMind 的边界

RunMind 记录过程、上下文和原因。

RunDoc 记录沉淀后的正式依据。

```text
为什么这么决定 -> RunMind
以后按什么规则执行 -> RunDoc
这条规则从哪个决策来 -> RunDoc 引用 RunMind
```

重要 Memo 可以提炼为 Doc，但不是所有 Memo 都要变成 Doc。

## 3. 与 RunLoop 的边界

RunLoop 记录交付事实。

RunDoc 记录正式知识资产。

```text
今天做了什么 -> RunLoop
交付物是否可验收 -> RunLoop
验收规则是什么 -> RunDoc
接口字段最终定义是什么 -> RunDoc
项目变化导致文档过期 -> RunDoc 生成更新任务
```

## 4. RunDoc 在 RunOS 中提供什么

RunOS Command Center 从 RunDoc 获取：

```text
过期文档
最近更新文档
待审核文档补丁
决策缺失文档
可复用 SOP
项目相关正式知识
AI 可引用上下文
腾讯生态接入规范和运维文档
```

Ask RunOS 查询正式规则时，优先引用 RunDoc。

## 5. 文档保鲜闭环

RunDoc 的核心闭环：

```text
Detect -> Understand -> Map -> Patch -> Review -> Commit
```

来源可以是：

```text
Git diff
RunLoop Artifact
RunLoop Decision Proposal
RunMind 决策记忆
人工提交
Agent 检查
企业微信 / 微信 / 小程序 / 腾讯云事件沉淀后的正式规则
```

输出必须可审核：

```text
受影响文档
受影响段落
建议补丁
证据来源
审核状态
提交记录
```

## 6. 第一阶段接口

RunOS 接入 RunDoc 的最小接口：

```text
GET /api/docs/search
GET /api/docs/context
GET /api/docs/stale
GET /api/docs/recent
GET /api/docs/review-queue

POST /api/rundoc/scan
POST /api/rundoc/patch
POST /api/rundoc/review
```

## 7. RunDoc 成功标准

RunDoc 成功的标准不是“文档很多”。

成功标准是：

```text
RunOS 能知道哪些正式知识可以引用。
RunOS 能发现哪些文档已经过期。
RunOS 能把已确认决策沉淀成正式文档。
AI 回答正式规则时能引用稳定文档，而不是临时记忆。
```
