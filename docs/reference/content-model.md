---
title: Content Model
---

# Content Model

RunDoc 的数据模型分三层：项目变更、文档目标、补丁产物。

## 1) Change Event

```text
change_id
base_commit
head_commit
changed_paths[]
commit_messages[]
detected_at
```

## 2) Impact Mapping

```text
change_id
impact_domain         # product / technical / ai / ops / business / decisions
reason
target_docs[]
confidence
needs_human_review
```

## 3) Document Patch

```text
doc_path
patch_type            # update / create / conflict
summary
diff_preview
applied
```

## 4) Generated Report

```text
run_id
report_path
affected_docs[]
conflicts[]
followups[]
```

## 5) 站点渲染模型（已有）

```text
doc_id
path
title
section
tags
summary
headings
chunks
links
updated_at
source_hash
```

以上模型把“文档站渲染”与“项目变更感知”拆开，避免把 RunDoc 降级成纯静态发布器。
