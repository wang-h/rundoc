import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Breadcrumb,
  Space,
  Input,
  Tabs,
  App,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  EyeOutlined,
  EditOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { MarkdownEditor } from '@/components/MarkdownEditor';
import { documentsApi, projectsApi } from '@/utils/api';
import { mockDocuments } from '@/utils/mock-data';
import type { Document } from '@/utils/api';

const { Title, Text, Paragraph } = Typography;

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
  h1: ({ children, ...props }: ComponentPropsWithoutRef<'h1'>) => (
    <Title level={1} id={props.id}>
      {children}
    </Title>
  ),
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

export function DocEditPage() {
  const { projectId, docId } = useParams<{ projectId: string; docId: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [activeTab, setActiveTab] = useState<string>('edit');

  const loadDoc = useCallback(async () => {
    if (!projectId || !docId) return;
    setLoading(true);
    try {
      const data = await documentsApi.get(projectId, docId);
      setDocument(data.document);
      setTitle(data.document.title);
      setContent(data.document.content);
    } catch {
      // Fallback to mock data
      const docs = mockDocuments[projectId] || [];
      const doc = docs.find((d) => d.id === docId);
      if (doc) {
        setDocument(doc);
        setTitle(doc.title);
        setContent(doc.content);
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

  const handleSave = useCallback(
    async (status?: string) => {
      if (!projectId || !docId || !document) return;
      setSaving(true);
      try {
        await documentsApi.update(projectId, docId, {
          title,
          content,
          ...(status ? { status } : {}),
        });
        message.success(status === 'draft' ? 'Saved as draft' : 'Document saved');
      } catch {
        // Update mock data
        const docs = mockDocuments[projectId];
        if (docs) {
          const doc = docs.find((d) => d.id === docId);
          if (doc) {
            doc.title = title;
            doc.content = content;
            doc.updated_at = new Date().toISOString();
            if (status) doc.status = status;
          }
        }
        message.info(status === 'draft' ? 'Saved as draft (mock mode)' : 'Document saved (mock mode)');
      } finally {
        setSaving(false);
      }
    },
    [projectId, docId, document, title, content, message]
  );

  const handleKeyboardSave = useCallback(() => {
    handleSave();
  }, [handleSave]);

  const handleCancel = () => {
    navigate(`/projects/${projectId}/docs/${docId}`);
  };

  const docTitle = useMemo(() => {
    if (!document) return 'Untitled';
    const match = /^#\s+(.+)$/m.exec(document.content);
    return match ? match[1].trim() : document.title;
  }, [document]);

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
          { title: <Link to={`/projects/${projectId}/docs/${docId}`}>{docTitle}</Link> },
          { title: 'Edit' },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileTextOutlined style={{ fontSize: 18, color: '#0a0a0a' }} />
            <Title level={2} style={{ margin: 0 }}>
              Edit Document
            </Title>
          </div>
          <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
            {document.title}
          </Text>
        </div>

        <Space>
          <Button
            icon={<SaveOutlined />}
            onClick={() => handleSave('draft')}
            loading={saving}
          >
            Save Draft
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => handleSave('published')}
            loading={saving}
          >
            Save & Publish
          </Button>
          <Button icon={<CloseOutlined />} onClick={handleCancel} danger>
            Cancel
          </Button>
        </Space>
      </div>

      {/* Title input */}
      <div style={{ marginBottom: 16 }}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Document Title"
          size="large"
          style={{
            fontSize: 20,
            fontWeight: 600,
            border: '1px solid #f0f0f0',
            borderRadius: 6,
          }}
        />
      </div>

      {/* Editor + Preview tabs */}
      <div
        style={{
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          overflow: 'hidden',
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ padding: '0 16px' }}
          items={[
            {
              key: 'edit',
              label: (
                <span>
                  <EditOutlined /> Edit
                </span>
              ),
              children: (
                <div style={{ padding: '0 0 16px' }}>
                  <MarkdownEditor
                    content={content}
                    onChange={setContent}
                    editable={true}
                    placeholder="Write your documentation in Markdown..."
                    minHeight="500px"
                    onSave={handleKeyboardSave}
                  />
                </div>
              ),
            },
            {
              key: 'preview',
              label: (
                <span>
                  <EyeOutlined /> Preview
                </span>
              ),
              children: (
                <div
                  style={{
                    padding: '16px 24px',
                    minHeight: 500,
                    background: '#fff',
                  }}
                  className="doc-prose"
                >
                  <Title level={1}>{title}</Title>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSlug]}
                    components={markdownComponents}
                  >
                    {content || '*No content yet*'}
                  </ReactMarkdown>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
