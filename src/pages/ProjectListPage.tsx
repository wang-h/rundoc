import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Typography,
  Button,
  Row,
  Col,
  Breadcrumb,
  Spin,
} from 'antd';
import { PlusOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectModal } from '@/components/CreateProjectModal';
import { projectsApi, documentsApi } from '@/utils/api';
import { mockProjects, mockDocuments } from '@/utils/mock-data';
import type { Project } from '@/utils/api';

const { Title, Text } = Typography;

export function ProjectListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [docCounts, setDocCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectsApi.list();
      setProjects(data.projects);

      // Load doc counts for each project
      const counts: Record<string, number> = {};
      for (const p of data.projects) {
        try {
          const docsData = await documentsApi.list(p.id);
          counts[p.id] = docsData.documents.length;
        } catch {
          counts[p.id] = (mockDocuments[p.id] || []).length;
        }
      }
      setDocCounts(counts);
    } catch {
      // Fallback to mock data
      setProjects(mockProjects);
      const counts: Record<string, number> = {};
      for (const p of mockProjects) {
        counts[p.id] = (mockDocuments[p.id] || []).length;
      }
      setDocCounts(counts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreated = () => {
    loadProjects();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { title: <Link to="/">Home</Link> },
          { title: 'Projects' },
        ]}
        style={{ marginBottom: 24 }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 32,
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <FolderOpenOutlined style={{ marginRight: 12, color: '#0a0a0a' }} />
            Projects
          </Title>
          <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalOpen(true)}
          size="large"
        >
          New Project
        </Button>
      </div>

      {/* Project grid */}
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <FolderOpenOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
          <div>
            <Text type="secondary" style={{ fontSize: 16 }}>
              No projects yet
            </Text>
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Create your first project to start managing documents.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            style={{ marginTop: 16 }}
          >
            New Project
          </Button>
        </div>
      ) : (
        <Row gutter={[20, 20]}>
          {projects.map((project) => (
            <Col key={project.id} xs={24} sm={12} lg={8}>
              <ProjectCard
                project={project}
                docCount={docCounts[project.id] || 0}
              />
            </Col>
          ))}
        </Row>
      )}

      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
