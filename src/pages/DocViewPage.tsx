import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Breadcrumb,
  Space,
  Tag,
  Divider,
  App,
  Spin,
  Popconfirm,
  Timeline,
  Row,
  Col,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  HistoryOutlined,
  BranchesOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { documentsApi, projectsApi } from '@/utils/api';
import { mockDocuments, mockHistory } from '@/utils/mock-data';
import type { Document, HistoryEntry } from '@/utils/api';

const { Title, Text, Paragraph } = Typography;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

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

const markdownComponents = {
  h1: () => null,
  h2: ({ children, ...props }: ComponentPropsWithoutRef<'h2'>) => (
    <Title level={2} style={{ marginTop: 32 }} id={props.id}>
      {children}
    </Title>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<'h3'>) => (
    <Title level={3} id={props.id}>
      {children}
    </Title>
  ),
  p: ({ children, ...props }: ComponentPropsWithoutRef<'p'>) => (
    <Paragraph style={{ lineHeight: 1.75, marginBottom: 16 }} {...props}>
      {children}
    </Paragraph>
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
  a: ({ href = '', children, ...props }: ComponentPropsWithoutRef<'a'>) => (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined} {...props}>
      {children}
    </a>
  ),
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

export function DocViewPage() {
  const { projectId, docId } = useParams<{ projectId: string; docId: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [document, setDocument] = useState<Document | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [projectName, setProjectName] = useState('');

  const loadDoc = useCallback(async () => {
    if (!projectId || !docId) return;
    setLoading(true);
    try {
      const data = await documentsApi.get(projectId, docId);
      setDocument(data.document);
      setHistory(data.history);
    } catch {
      // Fallback to mock data
      const docs = mockDocuments[projectId] || [];
      const doc = docs.find((d) => d.id === docId);
      if (doc) {
        setDocument(doc);
        setHistory(mockHistory[docId] || []);
      } else {
        message.error('Document not found');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, docId, message]);

  const loadProjectName = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await projectsApi.get(projectId);
      setProjectName(data.project.name);
    } catch {
      setProjectName(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    loadDoc();
    loadProjectName();
  }, [loadDoc, loadProjectName]);

  const title = useMemo(() => {
    if (!document) return 'Untitled';
    const match = /^#\s+(.+)$/m.exec(document.content);
    return match ? match[1].trim() : document.title;
  }, [document]);

  // Strip the leading h1 for rendering
  const bodyContent = useMemo(() => {
    if (!document) return '';
    const lines = document.content.split('\n');
    let cursor = 0;
    // Skip leading blank lines
    while (cursor < lines.length && !lines[cursor].trim()) cursor++;
    // Skip the h1 line
    if (cursor < lines.length && lines[cursor].trim().startsWith('# ')) cursor++;
    // Skip blank line after h1
    while (cursor < lines.length && !lines[cursor].trim()) cursor++;
    return lines.slice(cursor).join('\n');
  }, [document]);

  const handleDelete = async () => {
    if (!projectId || !docId) return;
    setDeleting(true);
    try {
      await documentsApi.delete(projectId, docId);
      message.success('Document deleted');
    } catch {
      // Remove from mock data
      const docs = mockDocuments[projectId];
      if (docs) {
        const idx = docs.findIndex((d) => d.id === docId);
        if (idx >= 0) docs.splice(idx, 1);
      }
      message.info('Document deleted (mock mode)');
    }
    setDeleting(false);
    navigate(`/projects/${projectId}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!document) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
        <Title level={3}>Document not found</Title>
        <Link to={`/projects/${projectId}`}>
          <Button icon={<ArrowLeftOutlined />}>Back to Project</Button>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { title: <Link to="/">Home</Link> },
          { title: <Link to="/projects">Projects</Link> },
          { title: <Link to={`/projects/${projectId}`}>{projectName || 'Project'}</Link> },
          { title },
        ]}
        style={{ marginBottom: 24 }}
      />

      <Row gutter={32}>
        {/* Main content */}
        <Col xs={24} lg={18}>
          {/* Document header */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <FileTextOutlined style={{ fontSize: 18, color: '#0a0a0a' }} />
                  <Title level={2} style={{ margin: 0 }}>
                    {title}
                  </Title>
                </div>
                <Space size="middle" style={{ marginTop: 8 }}>
                  <Tag color={document.status === 'published' ? 'green' : 'orange'}>
                    {document.status}
                  </Tag>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    Updated {formatDate(document.updated_at)}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    <BranchesOutlined style={{ marginRight: 4 }} />
                    {history.length} version{history.length !== 1 ? 's' : ''}
                  </Text>
                </Space>
              </div>

              <Space>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/projects/${projectId}/docs/${docId}/edit`)}
                >
                  Edit
                </Button>
                <Popconfirm
                  title="Delete this document?"
                  description="This action cannot be undone."
                  onConfirm={handleDelete}
                  okText="Delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger icon={<DeleteOutlined />} loading={deleting}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            </div>
          </div>

          <Divider style={{ margin: '0 0 24px' }} />

          {/* Markdown content */}
          <article className="doc-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug]}
              components={markdownComponents}
            >
              {bodyContent}
            </ReactMarkdown>
          </article>
        </Col>

        {/* Sidebar: Version history */}
        <Col xs={24} lg={6}>
          <div
            style={{
              position: 'sticky',
              top: 80,
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              padding: 20,
            }}
          >
            <Title level={5} style={{ marginTop: 0 }}>
              <HistoryOutlined style={{ marginRight: 8 }} />
              Version History
            </Title>

            {history.length === 0 ? (
              <Text type="secondary" style={{ fontSize: 13 }}>
                No version history available.
              </Text>
            ) : (
              <Timeline
                items={history.map((entry) => ({
                  children: (
                    <div>
                      <div style={{ fontSize: 13, marginBottom: 2 }}>
                        {entry.change_summary}
                      </div>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {entry.changed_by} · {formatDate(entry.created_at)}
                      </Text>
                    </div>
                  ),
                }))}
                style={{ marginTop: 12 }}
              />
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}
