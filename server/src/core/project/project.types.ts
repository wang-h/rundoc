export interface Project {
  id: string
  slug_id: string
  name: string
  description: string
  git_repo_url: string
  workspace_id: string
  org_id: string
  created_by: string
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface CreateProjectInput {
  name: string
  slug_id?: string
  description?: string
  git_repo_url?: string
  workspace_id?: string
  org_id?: string
}

export interface UpdateProjectInput {
  name?: string
  slug_id?: string
  description?: string
  git_repo_url?: string
  workspace_id?: string
  org_id?: string
}
