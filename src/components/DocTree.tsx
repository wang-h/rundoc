import { useNavigate } from 'react-router-dom';
import { Tree, Typography } from 'antd';
import {
  FileTextOutlined,
  FileOutlined,
} from '@ant-design/icons';
import type { Document } from '@/utils/api';
import type { DataNode } from 'antd/es/tree';

const { Text } = Typography;

interface DocTreeProps {
  documents: Document[];
  projectId: string;
}

function buildTreeData(docs: Document[]): DataNode[] {
  const docMap = new Map<string, Document>();
  const childrenMap = new Map<string | null, Document[]>();
  const roots: Document[] = [];

  for (const doc of docs) {
    docMap.set(doc.id, doc);
    const parentKey = doc.parent_doc_id || null;
    if (!childrenMap.has(parentKey)) {
      childrenMap.set(parentKey, []);
    }
    childrenMap.get(parentKey)!.push(doc);
  }

  // Sort by position
  for (const [, list] of childrenMap) {
    list.sort((a, b) => a.position.localeCompare(b.position));
  }

  roots.push(...(childrenMap.get(null) || []));
  roots.sort((a, b) => a.position.localeCompare(b.position));

  function toNode(doc: Document): DataNode {
    const childDocs = childrenMap.get(doc.id) || [];
    return {
      key: doc.id,
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {childDocs.length > 0 ? (
            <FileTextOutlined style={{ color: '#0a0a0a', fontSize: 14 }} />
          ) : (
            <FileOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
          )}
          <span>{doc.title}</span>
          <Text
            type={doc.status === 'published' ? 'success' : 'warning'}
            style={{ fontSize: 11, marginLeft: 4 }}
          >
            {doc.status}
          </Text>
        </span>
      ),
      icon: undefined,
      children: childDocs.map(toNode),
      isLeaf: childDocs.length === 0,
    };
  }

  return roots.map(toNode);
}

export function DocTree({ documents, projectId }: DocTreeProps) {
  const navigate = useNavigate();

  const treeData = buildTreeData(documents);

  if (documents.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 0',
          color: '#bfbfbf',
        }}
      >
        <FileOutlined style={{ fontSize: 32, marginBottom: 12 }} />
        <div>
          <Text type="secondary">No documents yet.</Text>
        </div>
        <div>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Click "New Doc" to create the first document.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <Tree
      showIcon={false}
      treeData={treeData}
      defaultExpandAll
      blockNode
      onSelect={(keys) => {
        if (keys.length > 0) {
          const key = keys[0] as string;
          navigate(`/projects/${projectId}/docs/${key}`);
        }
      }}
      style={{
        background: 'transparent',
        fontSize: 14,
      }}
    />
  );
}
