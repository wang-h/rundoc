const REPO_ROOT = '/Users/hao/Workspace/rundoc/';
const DOCS_ROOT = '/Users/hao/Workspace/rundoc/docs/';
const GITHUB_BLOB_BASE = 'https://github.com/wang-h/rundoc/blob/main';

function stripLineSuffix(target: string): { path: string; line?: string } {
  const match = /^(.*?)(?::(\d+))?$/.exec(target);
  if (!match) return { path: target };
  return { path: match[1]!, line: match[2] };
}

function toDocsRoute(relativeDocsPath: string): string {
  const withoutExt = relativeDocsPath.replace(/\.md$/, '');
  return withoutExt === 'overview' ? '/docs/overview' : `/docs/${withoutExt}`;
}

function toGithubBlobUrl(repoRelativePath: string, line?: string): string {
  const cleanPath = repoRelativePath.replace(/^\/+/, '');
  return line ? `${GITHUB_BLOB_BASE}/${cleanPath}#L${line}` : `${GITHUB_BLOB_BASE}/${cleanPath}`;
}

export function resolveMarkdownHref(href: string, currentRoute: string): string {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|javascript:)/i.test(href) || href.startsWith('#')) return href;

  const [rawPath, hash = ''] = href.split('#');
  const hashSuffix = hash ? `#${hash}` : '';

  if (rawPath.startsWith('/docs/') || rawPath === '/') {
    return `${rawPath}${hashSuffix}`;
  }

  if (rawPath.startsWith(REPO_ROOT)) {
    const { path, line } = stripLineSuffix(rawPath);
    if (path.startsWith(DOCS_ROOT)) {
      const relativeDocsPath = path.slice(DOCS_ROOT.length);
      return `${toDocsRoute(relativeDocsPath)}${hashSuffix}`;
    }

    const repoRelativePath = path.slice(REPO_ROOT.length);
    return `${toGithubBlobUrl(repoRelativePath, line)}${hashSuffix}`;
  }

  const currentDocsPath = currentRoute.startsWith('/docs/') ? currentRoute.slice('/docs/'.length) : 'overview';
  const currentAbsFile = `${DOCS_ROOT}${currentDocsPath}.md`;
  const resolvedAbs = new URL(rawPath, `file://${currentAbsFile}`).pathname;

  if (resolvedAbs.startsWith(DOCS_ROOT)) {
    const relativeDocsPath = resolvedAbs.slice(DOCS_ROOT.length);
    if (relativeDocsPath.endsWith('.md')) {
      return `${toDocsRoute(relativeDocsPath)}${hashSuffix}`;
    }
  }

  if (resolvedAbs.startsWith(REPO_ROOT)) {
    const repoRelativePath = resolvedAbs.slice(REPO_ROOT.length);
    return `${toGithubBlobUrl(repoRelativePath)}${hashSuffix}`;
  }

  return `${rawPath}${hashSuffix}`;
}
