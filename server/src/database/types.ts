import type { Generated } from 'kysely'

export interface ProjectsTable {
  id: string
  slug_id: string
  name: string
  description: string
  git_repo_url: string
  workspace_id: string
  org_id: string
  created_by: string
  status: Generated<string>
  created_at: string
  updated_at: string
}

export interface DocumentsTable {
  id: string
  slug_id: string
  title: string
  content: string
  project_id: string
  parent_doc_id: string | null
  position: string
  status: Generated<string>
  last_updated_by: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DocumentHistoryTable {
  id: string
  document_id: string
  title: string
  content: string
  changed_by: string
  change_summary: string
  created_at: string
}

export interface Database {
  projects: ProjectsTable
  documents: DocumentsTable
  document_history: DocumentHistoryTable
}
