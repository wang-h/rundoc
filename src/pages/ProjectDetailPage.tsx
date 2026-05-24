import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Breadcrumb,
  Space,
  Tag,
  App,
  Spin,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  GithubOutlined,
  ArrowLeftOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { DocTree } from '@/components/DocTree';
import { CreateDocModal } from '@/components/CreateDocModal';
import { projectsApi, documentsApi } from '@/utils/api';
import { mockProjects, mockDocuments } from '@/utils/mock-data';
import type { Project, Document } from '@/utils/api';

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

function statusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'green';
    case 'archived':
      return 'default';
    default:
      return 'default';
  }
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDocOpen, setCreateDocOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [projectData, docsData] = await Promise.all([
        projectsApi.get(projectId),
        documentsApi.list(projectId),
      ]);
      setProject(projectData.project);
      setDocuments(docsData.documents);
    } catch {
      // Fallback to mock data
      const mockProject = mockProjects.find((p) => p.id === projectId);
      if (mockProject) {
        setProject(mockProject);
        setDocuments(mockDocuments[projectId] || []);
      } else {
        message.error('Project not found');
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, message]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!projectId) return;
    setDeleting(true);
    try {
      await projectsApi.delete(projectId);
      message.success('Project deleted');
    } catch {
      // Remove from mock data
      const idx = mockProjects.findIndex((p) => p.id === projectId);
      if (idx >= 0) {
        mockProjects.splice(idx, 1);
        delete mockDocuments[projectId];
      }
      message.info('Project deleted (mock mode)');
    }
    setDeleting(false);
    navigate('/projects');
  };

  const handleDocCreated = () => {
    loadData();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', padding: '80px 0' }}>
        <Title level={3}>Project not found</Title>
        <Link to="/projects">
          <Button icon={<ArrowLeftOutlined />}>Back to Projects</Button>
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
          { title: project.name },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Project header */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <Title level={3} style={{ margin: 0 }}>
                {project.name}
              </Title>
              <Tag color={statusColor(project.status)}>{project.status}</Tag>
            </div>
            <Paragraph
              type="secondary"
              style={{ margin: '4px 0 12px', fontSize: 14, lineHeight: 1.6 }}
            >
              {project.description || 'No description'}
            </Paragraph>
            <Space size="middle" wrap>
              {project.git_repo_url && (
                <a
                  href={project.git_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#525252', fontSize: 13 }}
                >
                  <GithubOutlined style={{ marginRight: 4 }} />
                  Repository
                </a>
              )}
              <Text type="secondary" style={{ fontSize: 13 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                Updated {formatDate(project.updated_at)}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </Text>
            </Space>
          </div>

          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateDocOpen(true)}
            >
              New Doc
            </Button>
            <Popconfirm
              title="Delete this project?"
              description="This action cannot be undone. All documents in this project will also be deleted."
              onConfirm={handleDelete}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={deleting}
              >
                Delete
              </Button>
            </Popconfirm>
          </Space>
        </div>
      </div>

      {/* Document tree */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          padding: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Title level={4} style={{ margin: 0 }}>
            Documents
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {documents.length} doc{documents.length !== 1 ? 's' : ''}
          </Text>
        </div>
        <DocTree documents={documents} projectId={project.id} />
      </div>

      <CreateDocModal
        open={createDocOpen}
        projectId={project.id}
        documents={documents}
        onClose={() => setCreateDocOpen(false)}
        onCreated={handleDocCreated}
      />
    </div>
  );
}
