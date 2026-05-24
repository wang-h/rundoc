const API_BASE = '/api';

async function api<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

// Types
export interface Project {
  id: string;
  slug_id: string;
  name: string;
  description: string;
  git_repo_url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  slug_id: string;
  title: string;
  content: string;
  project_id: string;
  parent_doc_id: string | null;
  status: string;
  position: string;
  last_updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  content: string;
  changed_by: string;
  change_summary: string;
  created_at: string;
}

// Projects API
export const projectsApi = {
  list: () => api<{ projects: Project[] }>('/projects'),
  get: (id: string) => api<{ project: Project }>(`/projects/${id}`),
  create: (body: { name: string; description: string; git_repo_url: string }) =>
    api<{ project: Project }>('/projects', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (id: string, body: { name?: string; description?: string; git_repo_url?: string }) =>
    api<{ project: Project }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (id: string) =>
    api<{ success: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
};

// Documents API
export const documentsApi = {
  list: (projectId: string) =>
    api<{ documents: Document[] }>(`/projects/${projectId}/docs`),
  get: (projectId: string, docId: string) =>
    api<{ document: Document; history: HistoryEntry[] }>(
      `/projects/${projectId}/docs/${docId}`
    ),
  create: (
    projectId: string,
    body: { title: string; content: string; parent_doc_id?: string }
  ) =>
    api<{ document: Document }>(`/projects/${projectId}/docs`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  update: (
    projectId: string,
    docId: string,
    body: { title?: string; content?: string; status?: string }
  ) =>
    api<{ document: Document }>(`/projects/${projectId}/docs/${docId}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  delete: (projectId: string, docId: string) =>
    api<{ success: boolean }>(`/projects/${projectId}/docs/${docId}`, {
      method: 'DELETE',
    }),
  getHistory: (projectId: string, docId: string) =>
    api<{ history: HistoryEntry[] }>(
      `/projects/${projectId}/docs/${docId}/history`
    ),
};
