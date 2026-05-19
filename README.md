# RunDoc

RunDoc 是一个跟随项目变更自动维护 Markdown 文档的 AI-native 文档机器人。  
一句话：**项目一变，文档就变。**

## 产品定位

RunDoc 不是资料收件箱，也不是“人先整理会议纪要再让 AI 总结”的系统。  
RunDoc 直接绑定项目仓库，以项目状态为输入，以文档更新为输出。

核心链路：

```text
Detect -> Understand -> Map -> Patch -> Commit
```

对应含义：

1. Detect: 发现项目变化（Git diff / commit / MR / docs 变化）
2. Understand: 理解变化影响范围
3. Map: 映射到目标文档
4. Patch: 生成并应用 Markdown 补丁
5. Commit: 产出可审阅提交（分支 / draft MR）

## 推荐目录

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

`docs/` 是正式文档唯一事实源；`.rundoc/` 是运行时配置与状态。

## 命令约定（MVP）

```bash
rundoc init
rundoc scan
rundoc write
rundoc check
rundoc commit
```

- `scan`: 基于 `last_commit..HEAD` 生成影响分析报告
- `write`: 更新受影响 Markdown 文档（优先更新已有文档）
- `check`: 检查冲突、缺失、过期
- `commit`: 生成可审阅文档提交

## 当前仓库说明

这个仓库当前仍包含文档站 UI（React + Vite）能力，用于浏览 `docs/`。  
后续演进方向是把“变更感知 + 自动文档更新”能力落到 CLI 和自动化流程。

## 开发文档站

```bash
npm install
npm run build
npm run dev
```
