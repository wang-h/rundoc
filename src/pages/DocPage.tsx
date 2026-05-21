import { useMemo, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Typography, Breadcrumb, Space, Button, Row, Col, Divider } from 'antd';
import {
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { TOC } from '@/components/TOC';
import { buildNavConfig, findNavItem, getPrevNext } from '@/utils/nav-config';
import { resolveMarkdownHref } from '@/utils/markdown-links';
import { useLocale } from '@/locales/LocaleContext';

const { Title, Paragraph, Text } = Typography;

function MarkdownCode({ className, children, ...props }: { className?: string; children?: ReactNode }) {
  if (className) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }
  return (
    <code
      style={{
        background: '#f5f5f5',
        padding: '2px 6px',
        borderRadius: 4,
        fontSize: '0.9em',
        fontFamily: "'JetBrains Mono', ui-monospace, monospace",
      }}
      {...props}
    >
      {children}
    </code>
  );
}

function createMarkdownComponents(currentRoute: string) {
  return {
    h1: ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => (
      <Title level={1} style={{ marginTop: 0 }} {...props}>{children}</Title>
    ),
    h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
      <Title level={2} style={{ marginTop: 32 }} {...props}>{children}</Title>
    ),
    h3: ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => (
      <Title level={3} {...props}>{children}</Title>
    ),
    p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
      <Paragraph style={{ lineHeight: 1.75 }} {...props}>{children}</Paragraph>
    ),
    pre: ({ children, ...props }: ComponentPropsWithoutRef<'pre'>) => (
      <pre
        style={{
          background: '#f5f5f5',
          padding: 16,
          borderRadius: 6,
          overflowX: 'auto',
          fontSize: 14,
          lineHeight: 1.6,
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
        }}
        {...props}
      >
        {children}
      </pre>
    ),
    code: MarkdownCode,
    a: ({ href = '', children, ...props }: ComponentPropsWithoutRef<'a'>) => {
      const resolved = resolveMarkdownHref(href, currentRoute);
      if (resolved === '/' || resolved.startsWith('/docs/')) {
        return (
          <Link to={resolved} {...props}>{children}</Link>
        );
      }
      if (resolved.startsWith('#')) {
        return (
          <a
            href={resolved}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(resolved.slice(1));
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    table: ({ children, ...props }: ComponentPropsWithoutRef<'table'>) => (
      <div style={{ overflowX: 'auto', margin: '16px 0' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }: ComponentPropsWithoutRef<'th'>) => (
      <th
        style={{
          border: '1px solid #f0f0f0',
          padding: '8px 12px',
          background: '#fafafa',
          textAlign: 'left',
          fontWeight: 600,
        }}
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: ComponentPropsWithoutRef<'td'>) => (
      <td style={{ border: '1px solid #f0f0f0', padding: '8px 12px' }} {...props}>
        {children}
      </td>
    ),
    blockquote: ({ children, ...props }: ComponentPropsWithoutRef<'blockquote'>) => (
      <blockquote
        style={{
          borderLeft: '3px solid #0a0a0a',
          margin: '16px 0',
          padding: '8px 16px',
          color: '#595959',
          background: '#fafafa',
        }}
        {...props}
      >
        {children}
      </blockquote>
    ),
    ul: ({ children, ...props }: ComponentPropsWithoutRef<'ul'>) => (
      <ul style={{ paddingLeft: 20, lineHeight: 1.75 }} {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: ComponentPropsWithoutRef<'ol'>) => (
      <ol style={{ paddingLeft: 20, lineHeight: 1.75 }} {...props}>{children}</ol>
    ),
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
    <Row gutter={32}>
      <Col xs={24} lg={18}>
        <article>
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { title: <Link to="/">{t.common.brandName}</Link> },
              ...(navItem ? [{ title: navItem.section.title }] : []),
              { title },
            ]}
            style={{ marginBottom: 16 }}
          />

          {/* Meta */}
          <div style={{ marginBottom: 32 }}>
            {navItem && (
              <Text type="secondary" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {navItem.section.title}
              </Text>
            )}
            <Title level={1} style={{ marginTop: 4 }}>
              {title}
            </Title>
            {summary && (
              <Paragraph
                style={{ fontSize: 16, color: '#595959', lineHeight: 1.75 }}
              >
                {summary}
              </Paragraph>
            )}
          </div>

          <Divider style={{ margin: '0 0 32px' }} />

          {/* Prose */}
          <div className="doc-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={markdownComponents}
            >
              {body}
            </ReactMarkdown>
          </div>

          {/* Pager */}
          {(prev || next) && (
            <>
              <Divider />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {prev ? (
                  <Link to={prev.path}>
                    <Button type="text" icon={<LeftOutlined />}>
                      <Space direction="vertical" size={0} style={{ textAlign: 'left' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{t.docPage.pagerPrev}</Text>
                        <Text>{prev.title}</Text>
                      </Space>
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}
                {next ? (
                  <Link to={next.path}>
                    <Button type="text">
                      <Space direction="vertical" size={0} style={{ textAlign: 'right' }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>{t.docPage.pagerNext}</Text>
                        <Text>{next.title}</Text>
                      </Space>
                      <RightOutlined />
                    </Button>
                  </Link>
                ) : null}
              </div>
            </>
          )}
        </article>
      </Col>

      <Col xs={0} lg={6}>
        <TOC content={body} />
      </Col>
    </Row>
  );
}
