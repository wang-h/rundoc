export interface Document {
  id: string
  slug_id: string
  title: string
  content: string
  project_id: string
  parent_doc_id: string | null
  position: string
  status: 'draft' | 'published' | 'archived'
  last_updated_by: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface DocumentHistory {
  id: string
  document_id: string
  title: string
  content: string
  changed_by: string
  change_summary: string
  created_at: string
}

export interface CreateDocumentInput {
  title: string
  slug_id?: string
  content?: string
  parent_doc_id?: string | null
  position?: string
}

export interface UpdateDocumentInput {
  title?: string
  slug_id?: string
  content?: string
  parent_doc_id?: string | null
  position?: string
  status?: 'draft' | 'published' | 'archived'
  change_summary?: string
}
