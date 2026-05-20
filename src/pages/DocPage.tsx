import { useMemo, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { TOC } from '@/components/TOC';
import { buildNavConfig, findNavItem, getPrevNext } from '@/utils/nav-config';
import { resolveMarkdownHref } from '@/utils/markdown-links';
import { useLocale } from '@/locales/LocaleContext';
import './DocPage.css';

/** 行内/块内 code 区分：块级一般带 `language-` class；无 class 视为行内 */
function MarkdownCode({ className, children, ...props }: { className?: string; children?: ReactNode }) {
  if (className) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
  return (
    <code className="doc-page__inline-code" {...props}>
      {children}
    </code>
  );
}

function createMarkdownComponents(currentRoute: string) {
  return {
    h1: ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => <h2 {...props}>{children}</h2>,
    h3: ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => <h3 {...props}>{children}</h3>,
    pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
      <pre className="doc-page__code-block" {...props}>
        {children}
      </pre>
    ),
    code: MarkdownCode,
    a: ({ href = '', children, ...props }: ComponentPropsWithoutRef<'a'>) => {
      const resolved = resolveMarkdownHref(href, currentRoute);
      if (resolved === '/' || resolved.startsWith('/docs/')) {
        return (
          <Link to={resolved} {...props}>
            {children}
          </Link>
        );
      }
      if (resolved.startsWith('#')) {
        return (
          <a
            href={resolved}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(resolved.slice(1));
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            {...props}
          >
            {children}
          </a>
        );
      }
      return (
        <a
          href={resolved}
          target={resolved.startsWith('http') ? '_blank' : undefined}
          rel={resolved.startsWith('http') ? 'noopener noreferrer' : undefined}
          {...props}
        >
          {children}
        </a>
      );
    },
  };
}

interface DocPageProps {
  rawContent?: string;
}

function extractTitle(markdown: string, fallback: string): string {
  const match = /^#\s+(.+)$/m.exec(markdown);
  return match ? match[1].trim() : fallback;
}

function stripLeadingSummary(markdown: string): { summary: string; body: string } {
  const lines = markdown.split('\n');
  let cursor = 0;
  while (cursor < lines.length && !lines[cursor].trim()) cursor++;
  while (cursor < lines.length && lines[cursor].trim().startsWith('#')) {
    cursor++;
    while (cursor < lines.length && !lines[cursor].trim()) cursor++;
  }
  const first = lines[cursor]?.trim() ?? '';
  const looksLikeList = /^(\s*[-*+] |\s*\d+\. )/.test(first);
  if (!first || first.startsWith('#') || first.startsWith('```') || first.startsWith('|') || looksLikeList) {
    return { summary: '', body: markdown };
  }
  const nextIdx = cursor + 1;
  const body = [...lines.slice(0, cursor), ...lines.slice(nextIdx)].join('\n');
  return { summary: first, body };
}

export function DocPage({ rawContent = '' }: DocPageProps) {
  const { t } = useLocale();
  const location = useLocation();
  const navConfig = buildNavConfig(t);
  const navItem = findNavItem(navConfig, location.pathname);
  const { prev, next } = getPrevNext(navConfig, location.pathname);
  const markdownComponents = useMemo(() => createMarkdownComponents(location.pathname), [location.pathname]);
  const title = useMemo(() => extractTitle(rawContent, t.docPage.untitled), [rawContent, t.docPage.untitled]);
  const { summary, body } = useMemo(() => stripLeadingSummary(rawContent), [rawContent]);

  return (
    <article className="doc-page">
      <div className="doc-page__main">
        <div className="doc-page__meta">
          <p className="doc-page__section">{navItem?.section.title || t.docPage.sectionFallback}</p>
          <h1 className="doc-page__title">{title}</h1>
          {summary && (
            <div className="doc-page__summary doc-page__prose">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {summary}
              </ReactMarkdown>
            </div>
          )}
        </div>

        <div className="doc-page__prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
            components={markdownComponents}
          >
            {body}
          </ReactMarkdown>
        </div>

        {(prev || next) && (
          <nav className="doc-page__pager">
            {prev ? (
              <Link to={prev.path} className="doc-page__pager-link">
                <span className="doc-page__pager-label">{t.docPage.pagerPrev}</span>
                <strong>{prev.title}</strong>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={next.path} className="doc-page__pager-link doc-page__pager-link--next">
                <span className="doc-page__pager-label">{t.docPage.pagerNext}</span>
                <strong>{next.title}</strong>
              </Link>
            ) : null}
          </nav>
        )}
      </div>

      <div className="doc-page__aside">
        <TOC content={body} />
      </div>
    </article>
  );
}
