import { useState } from 'react';
import { Modal, Form, Input, App } from 'antd';
import { projectsApi } from '@/utils/api';
import { mockProjects } from '@/utils/mock-data';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateProjectModal({ open, onClose, onCreated }: CreateProjectModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      try {
        await projectsApi.create(values);
        message.success('Project created successfully');
      } catch {
        // Fallback to mock if API unavailable
        const mockProject = {
          id: `proj-mock-${Date.now()}`,
          slug_id: values.name.toLowerCase().replace(/\s+/g, '-'),
          name: values.name,
          description: values.description || '',
          git_repo_url: values.git_repo_url || '',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        mockProjects.unshift(mockProject);
        message.info('Project created (mock mode)');
      }

      form.resetFields();
      onCreated();
      onClose();
    } catch {
      // Validation error, form will show messages
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Create Project"
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
          name="name"
          label="Project Name"
          rules={[{ required: true, message: 'Please enter a project name' }]}
        >
          <Input placeholder="My Project" autoFocus />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} placeholder="What is this project about?" />
        </Form.Item>
        <Form.Item
          name="git_repo_url"
          label="Git Repository URL"
        >
          <Input placeholder="https://github.com/org/repo" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
