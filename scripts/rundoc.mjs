#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rundocRoot = path.join(root, '.rundoc');
const configFile = path.join(rundocRoot, 'config.yml');
const dotEnvFile = path.join(root, '.env');
const docsLegacyRoot = path.join(root, 'docs_legacy');

const defaults = {
  project: {
    name: 'RunDoc',
    docs_root: 'docs',
    default_locale: 'zh-CN'
  },
  schedule: {
    cadence: 'daily',
    run_at: '09:00',
    timezone: 'Asia/Shanghai'
  },
  state: {
    last_commit_file: '.rundoc/state/last_commit.txt',
    last_scan_file: '.rundoc/state/last_scan.json',
    doc_index_file: '.rundoc/state/doc_index.json'
  },
  reports: {
    output_dir: '.rundoc/reports'
  }
};

function parseScalar(raw) {
  const value = raw.trim();
  if (!value) return '';
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function parseSimpleYaml(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  let section = null;
  let subsection = null;

  for (const raw of lines) {
    const line = raw.replace(/\t/g, '    ');
    if (!line.trim() || line.trim().startsWith('#')) continue;

    const mTop = /^([a-zA-Z0-9_]+):\s*$/.exec(line);
    if (mTop) {
      section = mTop[1];
      subsection = null;
      if (!out[section]) out[section] = {};
      continue;
    }

    const mSecond = /^  ([a-zA-Z0-9_]+):\s*(.*)$/.exec(line);
    if (mSecond && section) {
      const [, key, val] = mSecond;
      if (val === '') {
        out[section][key] = {};
        subsection = key;
      } else {
        out[section][key] = parseScalar(val);
        subsection = null;
      }
      continue;
    }

    const mThirdKV = /^    ([a-zA-Z0-9_]+):\s*(.*)$/.exec(line);
    if (mThirdKV && section && subsection && typeof out[section][subsection] === 'object' && !Array.isArray(out[section][subsection])) {
      const [, key, val] = mThirdKV;
      out[section][subsection][key] = parseScalar(val);
      continue;
    }

    const mListItem = /^    -\s*(.+)$/.exec(line);
    if (mListItem && section && subsection) {
      if (!Array.isArray(out[section][subsection])) out[section][subsection] = [];
      out[section][subsection].push(parseScalar(mListItem[1]));
    }
  }

  return out;
}

function mergeConfig(base, extra) {
  const out = { ...base };
  for (const [key, value] of Object.entries(extra || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = mergeConfig(out[key] || {}, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv(dotEnvFile);

const yamlConfig = parseSimpleYaml(configFile);
const runtime = mergeConfig(defaults, yamlConfig);

runtime.project.default_locale = process.env.RUNDOC_DEFAULT_LOCALE || runtime.project.default_locale;
runtime.schedule.cadence = process.env.RUNDOC_SCHEDULE_CADENCE || runtime.schedule.cadence;
runtime.schedule.run_at = process.env.RUNDOC_SCHEDULE_RUN_AT || runtime.schedule.run_at;
runtime.schedule.timezone = process.env.RUNDOC_SCHEDULE_TIMEZONE || runtime.schedule.timezone;

const stateDir = path.dirname(path.join(root, runtime.state.last_commit_file));
const reportsDir = path.join(root, runtime.reports.output_dir);

const lastCommitFile = path.join(root, runtime.state.last_commit_file);
const lastScanFile = path.join(root, runtime.state.last_scan_file);

const standardDocTemplates = {
  'docs/00-positioning/overview.md': `---
title: 定位总览
---

# 定位总览

RunDoc 是一个项目变更驱动的文档自动维护系统。
`,
  'docs/01-product/page-specs.md': `---
title: 页面规格
---

# 页面规格

记录产品页面行为与边界，随代码变更持续更新。
`,
  'docs/02-business/process-notes.md': `---
title: 业务流程说明
---

# 业务流程说明

记录业务流程、角色分工和交付边界。
`,
  'docs/03-technical/api-routes.md': `---
title: API 路由总览
---

# API 路由总览

记录接口、参数、兼容性与迁移说明。
`,
  'docs/04-ai/ai-context.md': `---
title: AI Context
---

# AI Context

供 AI coding agent 使用的项目压缩上下文。
`,
  'docs/04-ai/code-change-map.md': `---
title: Code Change Map
---

# Code Change Map

维护“代码变更 -> 文档影响”的映射。
`,
  'docs/04-ai/acceptance-checklist.md': `---
title: 验收清单
---

# 验收清单

用于每次文档更新后的最小验收。
`,
  'docs/04-ai/known-inconsistencies.md': `---
title: 已知不一致
---

# 已知不一致

记录跨文档冲突与待人工确认项。
`,
  'docs/05-decisions/decision-log.md': `---
title: 决策记录
---

# 决策记录

记录关键产品、技术与流程决策。
`,
  'docs/06-ops/deployment.md': `---
title: 部署与运维
---

# 部署与运维

记录部署配置、运维流程与回滚路径。
`,
  'docs/07-archive/README.md': `---
title: Archive
---

# Archive

存放失效或历史版本文档。
`
};

const domainDocs = {
  positioning: ['docs/00-positioning/overview.md'],
  product: ['docs/01-product/page-specs.md'],
  business: ['docs/02-business/process-notes.md'],
  technical: ['docs/03-technical/api-routes.md'],
  ai: [
    'docs/04-ai/ai-context.md',
    'docs/04-ai/code-change-map.md',
    'docs/04-ai/acceptance-checklist.md',
    'docs/04-ai/known-inconsistencies.md'
  ],
  decisions: ['docs/05-decisions/decision-log.md'],
  ops: ['docs/06-ops/deployment.md']
};

function run(cmd, args, { allowFail = false } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    encoding: 'utf8'
  });
  if (result.status !== 0 && !allowFail) {
    const stderr = (result.stderr || '').trim();
    throw new Error(`${cmd} ${args.join(' ')} failed: ${stderr || 'unknown error'}`);
  }
  return {
    ok: result.status === 0,
    stdout: (result.stdout || '').trim(),
    stderr: (result.stderr || '').trim()
  };
}

function ensureDirs() {
  fs.mkdirSync(stateDir, { recursive: true });
  fs.mkdirSync(reportsDir, { recursive: true });
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function fileExists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function getHeadCommit() {
  return run('git', ['rev-parse', 'HEAD']).stdout;
}

function resolveBaseCommit(headCommit) {
  const raw = fs.existsSync(lastCommitFile) ? fs.readFileSync(lastCommitFile, 'utf8').trim() : '';
  if (raw && raw !== 'HEAD') {
    const check = run('git', ['rev-parse', '--verify', raw], { allowFail: true });
    if (check.ok) return check.stdout;
  }

  const prev = run('git', ['rev-parse', 'HEAD~1'], { allowFail: true });
  if (prev.ok) return prev.stdout;
  return headCommit;
}

function parseDiffLine(line) {
  const parts = line.split('\t');
  if (parts.length < 2) return null;
  const status = parts[0];
  if (status.startsWith('R') || status.startsWith('C')) {
    return { status, file: parts[2] || parts[1], oldFile: parts[1] };
  }
  return { status, file: parts[1] };
}

function getChanges(baseCommit, headCommit) {
  if (!baseCommit || !headCommit || baseCommit === headCommit) return [];
  const diff = run('git', ['diff', '--name-status', `${baseCommit}..${headCommit}`]).stdout;
  if (!diff) return [];
  return diff
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseDiffLine)
    .filter(Boolean);
}

function getCommitMessages(baseCommit, headCommit) {
  if (!baseCommit || !headCommit || baseCommit === headCommit) return [];
  const logs = run('git', ['log', '--pretty=format:%h %s', `${baseCommit}..${headCommit}`]).stdout;
  if (!logs) return [];
  return logs.split('\n').map((line) => line.trim()).filter(Boolean);
}

function addDocImpact(map, doc, reason) {
  if (!fileExists(doc)) return;
  if (!map.has(doc)) map.set(doc, new Set());
  map.get(doc).add(reason);
}

function assignByDomain(map, domain, reason) {
  const docs = domainDocs[domain] || [];
  for (const doc of docs) addDocImpact(map, doc, reason);
}

function inferImpacts(changes, commitMessages) {
  const impacts = new Map();
  const lowerMessages = commitMessages.join(' ').toLowerCase();

  for (const change of changes) {
    const rel = change.file.replace(/\\/g, '/');
    const lower = rel.toLowerCase();
    const reason = `${change.status} ${rel}`;

    if (lower.startsWith('docs/')) {
      addDocImpact(impacts, rel, `documentation changed directly: ${reason}`);
      if (lower.includes('/04-ai/')) assignByDomain(impacts, 'ai', reason);
      continue;
    }

    if (
      lower.startsWith('src/pages/') ||
      lower.startsWith('frontend/') ||
      lower.includes('/page') ||
      lower.includes('/component')
    ) {
      assignByDomain(impacts, 'product', reason);
    }

    if (
      lower.startsWith('backend/') ||
      lower.includes('/api') ||
      lower.includes('/route') ||
      lower.includes('/controller') ||
      lower.includes('/service') ||
      lower.includes('schema') ||
      lower.includes('migration') ||
      lower.includes('.sql') ||
      lower.includes('/db')
    ) {
      assignByDomain(impacts, 'technical', reason);
    }

    if (
      lower.includes('/ai') ||
      lower.includes('/prompt') ||
      lower.includes('llm') ||
      lower.includes('intent') ||
      lower.includes('assistant')
    ) {
      assignByDomain(impacts, 'ai', reason);
    }

    if (
      lower.includes('docker') ||
      lower.includes('compose') ||
      lower.includes('deploy') ||
      lower.includes('k8s') ||
      lower.includes('helm') ||
      lower.includes('nginx')
    ) {
      assignByDomain(impacts, 'ops', reason);
    }

    if (
      lower === 'readme.md' ||
      lower.startsWith('scripts/') ||
      lower.endsWith('config.yml') ||
      lower.endsWith('config.yaml')
    ) {
      assignByDomain(impacts, 'positioning', reason);
      assignByDomain(impacts, 'decisions', reason);
    }
  }

  if (/feat|breaking|policy|decision|adr/.test(lowerMessages)) {
    assignByDomain(impacts, 'decisions', 'commit messages indicate product/tech decision changes');
  }
  if (/fix|incident|deploy|infra/.test(lowerMessages)) {
    assignByDomain(impacts, 'ops', 'commit messages indicate operations/runtime behavior changes');
  }
  if (/prompt|ai|model|intent/.test(lowerMessages)) {
    assignByDomain(impacts, 'ai', 'commit messages indicate AI behavior changes');
  }

  return impacts;
}

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function uniqueReportPath() {
  const baseName = `${nowDate()}-run`;
  let n = 0;
  while (true) {
    const name = n === 0 ? `${baseName}.md` : `${baseName}-${n}.md`;
    const full = path.join(reportsDir, name);
    if (!fs.existsSync(full)) return full;
    n += 1;
  }
}

function writeScanReport({ baseCommit, headCommit, changes, commitMessages, impacts }) {
  const reportPath = uniqueReportPath();
  const impactedDocs = [...impacts.keys()].sort();
  const lines = [];

  lines.push('# RunDoc Scan Report', '');
  lines.push(`- Date: ${new Date().toISOString()}`);
  lines.push(`- Base commit: \`${baseCommit}\``);
  lines.push(`- Head commit: \`${headCommit}\``);
  lines.push(`- Change count: ${changes.length}`);
  lines.push('');

  lines.push('## Project Changes');
  if (changes.length === 0) {
    lines.push('- No committed changes found in this range.');
  } else {
    for (const change of changes) {
      const old = change.oldFile ? ` (from ${change.oldFile})` : '';
      lines.push(`- ${change.status} ${change.file}${old}`);
    }
  }
  lines.push('');

  lines.push('## Commit Messages');
  if (commitMessages.length === 0) {
    lines.push('- None');
  } else {
    for (const message of commitMessages) lines.push(`- ${message}`);
  }
  lines.push('');

  lines.push('## Potentially Impacted Docs');
  if (impactedDocs.length === 0) {
    lines.push('- None inferred. Manual review recommended.');
  } else {
    for (const doc of impactedDocs) lines.push(`- ${doc}`);
  }
  lines.push('');

  lines.push('## Suggested Updates');
  if (impactedDocs.length === 0) {
    lines.push('- No automated suggestions. Check whether this change should update docs/04-ai context.');
  } else {
    for (const doc of impactedDocs) {
      lines.push(`- ${doc}`);
      for (const reason of impacts.get(doc)) {
        lines.push(`  - reason: ${reason}`);
      }
    }
  }
  lines.push('');

  lines.push('## Manual Review Required');
  lines.push('- Confirm whether inferred mapping is complete.');
  lines.push('- Resolve cross-doc contradictions before merge.');

  fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
  return reportPath;
}

function writeTaskPrompt(reportPath) {
  const reportRel = path.relative(root, reportPath).replace(/\\/g, '/');
  const taskPath = reportPath.replace(/-run(\-\d+)?\.md$/, '-task.md');
  const lines = [
    '# RunDoc Agent Task',
    '',
    'Use this instruction for Codex or Claude.',
    '',
    '## Objective',
    'Apply documentation updates based on latest project changes.',
    '',
    '## Inputs',
    `- Report: \`${reportRel}\``,
    '- Source of truth: `docs/`',
    '- Runtime state: `.rundoc/state/*`',
    '',
    '## Required Workflow',
    '1. Detect: read report and verify git diff range.',
    '2. Understand: confirm impacted domains and gaps.',
    '3. Map: finalize target docs under `docs/`.',
    '4. Patch: apply minimal markdown edits (update existing first).',
    '5. Commit: produce reviewable commit or draft MR notes.',
    '',
    '## Hard Constraints',
    '- Do not invent product/API rules not present in code or existing docs.',
    '- Keep diffs minimal and traceable to commits.',
    '- If conflicts are found, update `docs/04-ai/known-inconsistencies.md`.',
    '',
    '## Deliverables',
    '- Updated `docs/**/*.md`',
    '- Updated `docs/04-ai/*` context files when impacted',
    '- Summary of what changed and why'
  ];
  fs.writeFileSync(taskPath, `${lines.join('\n')}\n`);
  return taskPath;
}

function cmdScan({ advance = false } = {}) {
  ensureDirs();
  const headCommit = getHeadCommit();
  const baseCommit = resolveBaseCommit(headCommit);
  const changes = getChanges(baseCommit, headCommit);
  const commitMessages = getCommitMessages(baseCommit, headCommit);
  const impacts = inferImpacts(changes, commitMessages);
  const reportPath = writeScanReport({ baseCommit, headCommit, changes, commitMessages, impacts });

  const scanState = {
    lastScanAt: new Date().toISOString(),
    baseCommit,
    headCommit,
    report: path.relative(root, reportPath).replace(/\\/g, '/'),
    changeCount: changes.length
  };
  writeJson(lastScanFile, scanState);

  if (advance) {
    fs.writeFileSync(lastCommitFile, `${headCommit}\n`);
  }

  console.log(JSON.stringify({ ok: true, report: scanState.report, baseCommit, headCommit, changeCount: changes.length }, null, 2));
}

function cmdTask() {
  ensureDirs();
  const reports = fs
    .readdirSync(reportsDir)
    .filter((f) => f.endsWith('.md') && f.includes('-run'))
    .map((name) => ({
      name,
      full: path.join(reportsDir, name),
      mtime: fs.statSync(path.join(reportsDir, name)).mtimeMs
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (reports.length === 0) {
    throw new Error('No scan report found. Run `node scripts/rundoc.mjs scan` first.');
  }

  const taskPath = writeTaskPrompt(reports[0].full);
  console.log(JSON.stringify({ ok: true, task: path.relative(root, taskPath).replace(/\\/g, '/') }, null, 2));
}

function cmdAdvance() {
  ensureDirs();
  const headCommit = getHeadCommit();
  fs.writeFileSync(lastCommitFile, `${headCommit}\n`);
  const current = readJson(lastScanFile, {});
  const next = {
    ...current,
    advancedAt: new Date().toISOString(),
    headCommit
  };
  writeJson(lastScanFile, next);
  console.log(JSON.stringify({ ok: true, headCommit }, null, 2));
}

function cmdCheck() {
  const required = [
    '.rundoc/config.yml',
    '.rundoc/state/last_commit.txt',
    '.rundoc/state/last_scan.json',
    'docs/00-positioning/overview.md',
    'docs/01-product/page-specs.md',
    'docs/02-business/process-notes.md',
    'docs/03-technical/api-routes.md',
    'docs/04-ai/ai-context.md',
    'docs/05-decisions/decision-log.md',
    'docs/06-ops/deployment.md'
  ];
  const missing = required.filter((f) => !fileExists(f));
  const result = {
    ok: missing.length === 0,
    missing,
    config: {
      locale: runtime.project.default_locale,
      cadence: runtime.schedule.cadence,
      runAt: runtime.schedule.run_at,
      timezone: runtime.schedule.timezone
    }
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

function cmdConfig() {
  console.log(
    JSON.stringify(
      {
        project: runtime.project,
        schedule: runtime.schedule,
        state: runtime.state,
        reports: runtime.reports,
        envOverrides: {
          RUNDOC_DEFAULT_LOCALE: process.env.RUNDOC_DEFAULT_LOCALE || null,
          RUNDOC_SCHEDULE_CADENCE: process.env.RUNDOC_SCHEDULE_CADENCE || null,
          RUNDOC_SCHEDULE_RUN_AT: process.env.RUNDOC_SCHEDULE_RUN_AT || null,
          RUNDOC_SCHEDULE_TIMEZONE: process.env.RUNDOC_SCHEDULE_TIMEZONE || null
        }
      },
      null,
      2
    )
  );
}

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFileIfMissing(relPath, content) {
  const abs = path.join(root, relPath);
  ensureParentDir(abs);
  if (!fs.existsSync(abs)) {
    fs.writeFileSync(abs, content.endsWith('\n') ? content : `${content}\n`);
  }
}

function createStandardDocs({ overwrite = false } = {}) {
  for (const [relPath, content] of Object.entries(standardDocTemplates)) {
    const abs = path.join(root, relPath);
    ensureParentDir(abs);
    if (overwrite || !fs.existsSync(abs)) {
      fs.writeFileSync(abs, content.endsWith('\n') ? content : `${content}\n`);
    }
  }
}

function createAgentTemplates() {
  writeFileIfMissing(
    '.rundoc/agents/AGENT.md',
    `# RunDoc Agent Protocol

Use this file as the stable execution role for Codex-style agents.

## Mission
- Follow Detect -> Understand -> Map -> Patch -> Commit.
- Update existing docs first.
- Keep patches minimal and traceable.

## Inputs
- .rundoc/reports/*-run.md
- .rundoc/config.yml
- docs_legacy/ (if migration context is needed)

## Required Outputs
- Updated docs/**/*.md
- Updated docs/04-ai/known-inconsistencies.md when conflicts exist
- Brief change summary with file list
`
  );

  writeFileIfMissing(
    '.rundoc/agents/CLAUDE.md',
    `# RunDoc Claude Protocol

Use this file as the stable execution role for Claude-style agents.

## Mission
- Execute Detect -> Understand -> Map -> Patch -> Commit from latest report.
- Do not invent facts not present in code/docs.
- Prefer edits to existing docs over creating new files.

## Inputs
- .rundoc/reports/*-run.md
- .rundoc/config.yml
- docs_legacy/ when migration is in progress

## Required Outputs
- Markdown patches under docs/
- Conflict notes under docs/04-ai/known-inconsistencies.md
- Reviewer-facing summary
`
  );
}

function createDefaultRundocStructure() {
  ensureDirs();
  fs.mkdirSync(path.join(rundocRoot, 'prompts'), { recursive: true });
  fs.mkdirSync(path.join(rundocRoot, 'agents'), { recursive: true });
  fs.mkdirSync(path.join(root, 'docs'), { recursive: true });
  writeFileIfMissing(
    runtime.state.last_commit_file,
    `${getHeadCommit()}\n`
  );
  writeFileIfMissing(
    runtime.state.last_scan_file,
    JSON.stringify({ lastScanAt: null, baseCommit: null, headCommit: null }, null, 2)
  );
  writeFileIfMissing(
    runtime.state.doc_index_file,
    JSON.stringify({ docs: [] }, null, 2)
  );
  createStandardDocs({ overwrite: false });
  createAgentTemplates();
}

function moveDocsToLegacy() {
  const docsPath = path.join(root, runtime.project.docs_root || 'docs');
  if (!fs.existsSync(docsPath)) return null;
  fs.mkdirSync(docsLegacyRoot, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  let target = path.join(docsLegacyRoot, stamp);
  let n = 0;
  while (fs.existsSync(target)) {
    n += 1;
    target = path.join(docsLegacyRoot, `${stamp}-${n}`);
  }
  fs.renameSync(docsPath, target);
  return path.relative(root, target).replace(/\\/g, '/');
}

function cmdInit({ rebuild = false } = {}) {
  let legacyPath = null;
  if (rebuild) {
    legacyPath = moveDocsToLegacy();
    fs.mkdirSync(path.join(root, runtime.project.docs_root || 'docs'), { recursive: true });
  }
  createDefaultRundocStructure();
  if (rebuild) {
    const reportPath = path.join(docsLegacyRoot, `migration-report-${new Date().toISOString().slice(0, 10)}.md`);
    const lines = [
      '# RunDoc Migration Report',
      '',
      `- Date: ${new Date().toISOString()}`,
      `- Legacy backup: ${legacyPath || 'none (no existing docs directory found)'}`,
      '- Action: rebuilt docs/ skeleton and preserved legacy docs under docs_legacy/',
      '',
      '## Next Step',
      '- Run `node scripts/rundoc.mjs scan` to produce impact report',
      '- Use Codex/Claude with .rundoc/agents/* protocol to migrate important legacy content'
    ];
    fs.writeFileSync(reportPath, `${lines.join('\n')}\n`);
  }
  console.log(JSON.stringify({ ok: true, rebuild, legacyBackup: legacyPath }, null, 2));
}

function printHelp() {
  console.log(`
RunDoc CLI (MVP)

Usage:
  node scripts/rundoc.mjs init [--rebuild]
  node scripts/rundoc.mjs scan [--advance]
  node scripts/rundoc.mjs task
  node scripts/rundoc.mjs check
  node scripts/rundoc.mjs config
  node scripts/rundoc.mjs advance
`.trim());
}

const [, , cmd, ...rest] = process.argv;

try {
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
  } else if (cmd === 'init') {
    cmdInit({ rebuild: rest.includes('--rebuild') });
  } else if (cmd === 'scan') {
    cmdScan({ advance: rest.includes('--advance') });
  } else if (cmd === 'task') {
    cmdTask();
  } else if (cmd === 'check') {
    cmdCheck();
  } else if (cmd === 'config') {
    cmdConfig();
  } else if (cmd === 'advance') {
    cmdAdvance();
  } else {
    printHelp();
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`[rundoc] ${error.message}`);
  process.exitCode = 1;
}
