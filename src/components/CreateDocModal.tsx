import { useState } from 'react';
import { Modal, Form, Input, Select, App } from 'antd';
import { documentsApi } from '@/utils/api';
import { mockDocuments } from '@/utils/mock-data';
import type { Document } from '@/utils/api';

interface CreateDocModalProps {
  open: boolean;
  projectId: string;
  documents: Document[];
  onClose: () => void;
  onCreated: () => void;
}

export function CreateDocModal({
  open,
  projectId,
  documents,
  onClose,
  onCreated,
}: CreateDocModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const body = {
        title: values.title,
        content: values.content || '# ' + values.title + '\n\nStart writing...',
        ...(values.parent_doc_id ? { parent_doc_id: values.parent_doc_id } : {}),
      };

      try {
        await documentsApi.create(projectId, body);
        message.success('Document created successfully');
      } catch {
        // Fallback to mock if API unavailable
        const mockDoc: Document = {
          id: `doc-mock-${Date.now()}`,
          slug_id: values.title.toLowerCase().replace(/\s+/g, '-'),
          title: values.title,
          content: body.content,
          project_id: projectId,
          parent_doc_id: values.parent_doc_id || null,
          status: 'draft',
          position: `a${(mockDocuments[projectId] || []).length}`,
          last_updated_by: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        if (!mockDocuments[projectId]) {
          mockDocuments[projectId] = [];
        }
        mockDocuments[projectId].push(mockDoc);
        message.info('Document created (mock mode)');
      }

      form.resetFields();
      onCreated();
      onClose();
    } catch {
      // Validation error
    } finally {
      setLoading(false);
    }
  };

  // Build parent doc options from existing documents
  const parentOptions = documents.map((doc) => ({
    label: doc.title,
    value: doc.id,
  }));

  return (
    <Modal
      title="Create Document"
      open={open}
      onOk={handleSubmit}
      onCancel={() => {
        form.resetFields();
        onClose();
      }}
      confirmLoading={loading}
      okText="Create"
      cancelText="Cancel"
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a document title' }]}
        >
          <Input placeholder="My Document" autoFocus />
        </Form.Item>
        <Form.Item
          name="parent_doc_id"
          label="Parent Document (optional)"
        >
          <Select
            placeholder="None (root level)"
            allowClear
            options={parentOptions}
          />
        </Form.Item>
        <Form.Item
          name="content"
          label="Initial Content (optional)"
        >
          <Input.TextArea
            rows={5}
            placeholder="# My Document&#10;&#10;Start writing your documentation..."
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: 13 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
}
