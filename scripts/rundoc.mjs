import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rundocRoot = path.join(root, '.rundoc');
const stateDir = path.join(rundocRoot, 'state');
const reportsDir = path.join(rundocRoot, 'reports');

const lastCommitFile = path.join(stateDir, 'last_commit.txt');
const lastScanFile = path.join(stateDir, 'last_scan.json');

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
    missing
  };
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
}

function printHelp() {
  console.log(`
RunDoc CLI (MVP)

Usage:
  node scripts/rundoc.mjs scan [--advance]
  node scripts/rundoc.mjs task
  node scripts/rundoc.mjs check
  node scripts/rundoc.mjs advance
`.trim());
}

const [, , cmd, ...rest] = process.argv;

try {
  if (!cmd || cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp();
  } else if (cmd === 'scan') {
    cmdScan({ advance: rest.includes('--advance') });
  } else if (cmd === 'task') {
    cmdTask();
  } else if (cmd === 'check') {
    cmdCheck();
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
