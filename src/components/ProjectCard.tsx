import { useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Tag } from 'antd';
import {
  FolderOutlined,
  FileTextOutlined,
  GithubOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { Project } from '@/utils/api';

const { Text, Paragraph } = Typography;

interface ProjectCardProps {
  project: Project;
  docCount: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', {
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
    case 'draft':
      return 'orange';
    default:
      return 'default';
  }
}

export function ProjectCard({ project, docCount }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      hoverable
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{ height: '100%' }}
      styles={{ body: { padding: 20 } }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Space>
            <FolderOutlined style={{ fontSize: 18, color: '#0a0a0a' }} />
            <Text strong style={{ fontSize: 16 }}>
              {project.name}
            </Text>
          </Space>
          <Tag color={statusColor(project.status)} style={{ margin: 0 }}>
            {project.status}
          </Tag>
        </div>

        {/* Description */}
        <Paragraph
          type="secondary"
          ellipsis={{ rows: 2 }}
          style={{ margin: 0, fontSize: 13, lineHeight: 1.6, minHeight: 42 }}
        >
          {project.description || 'No description'}
        </Paragraph>

        {/* Meta row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Space size="middle">
            <span style={{ color: '#8c8c8c', fontSize: 12 }}>
              <FileTextOutlined style={{ marginRight: 4 }} />
              {docCount} docs
            </span>
            {project.git_repo_url && (
              <a
                href={project.git_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ color: '#8c8c8c', fontSize: 12 }}
              >
                <GithubOutlined style={{ marginRight: 4 }} />
                Git
              </a>
            )}
          </Space>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {formatDate(project.updated_at)}
          </Text>
        </div>
      </Space>
    </Card>
  );
}
