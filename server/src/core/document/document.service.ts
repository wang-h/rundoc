import { db } from '../../database/db.js'
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
  Document,
  DocumentHistory,
} from './document.types.js'

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function now(): string {
  return new Date().toISOString()
}

export async function createDocument(
  projectId: string,
  input: CreateDocumentInput,
  userId: string,
): Promise<Document> {
  const id = crypto.randomUUID()
  const slugId = input.slug_id || generateSlug(input.title)
  const timestamp = now()

  const doc: Document = {
    id,
    slug_id: slugId,
    title: input.title,
    content: input.content || '',
    project_id: projectId,
    parent_doc_id: input.parent_doc_id || null,
    position: input.position || 'a0',
    status: 'draft',
    last_updated_by: userId,
    created_at: timestamp,
    updated_at: timestamp,
    deleted_at: null,
  }

  await db.insertInto('documents').values(doc).execute()
  return doc
}

export async function getDocuments(projectId: string): Promise<Document[]> {
  const docs = await db
    .selectFrom('documents')
    .selectAll()
    .where('project_id', '=', projectId)
    .where('deleted_at', 'is', null)
    .orderBy('position', 'asc')
    .execute()

  return docs as Document[]
}

export async function getDocumentById(id: string): Promise<Document | undefined> {
  const doc = await db
    .selectFrom('documents')
    .selectAll()
    .where('id', '=', id)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  return doc as Document | undefined
}

export async function updateDocument(
  id: string,
  input: UpdateDocumentInput,
  userId: string,
): Promise<Document | undefined> {
  // Fetch the current document first
  const existing = await db
    .selectFrom('documents')
    .selectAll()
    .where('id', '=', id)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  if (!existing) return undefined

  // Save current version to history before updating
  const historyEntry: DocumentHistory = {
    id: crypto.randomUUID(),
    document_id: existing.id,
    title: existing.title,
    content: existing.content,
    changed_by: userId,
    change_summary: input.change_summary || '',
    created_at: now(),
  }

  await db.insertInto('document_history').values(historyEntry).execute()

  // Build update object
  const updates: Record<string, unknown> = {
    updated_at: now(),
    last_updated_by: userId,
  }

  if (input.title !== undefined) {
    updates.title = input.title
    updates.slug_id =
      input.slug_id || generateSlug(input.title)
  }
  if (input.slug_id !== undefined) updates.slug_id = input.slug_id
  if (input.content !== undefined) updates.content = input.content
  if (input.parent_doc_id !== undefined)
    updates.parent_doc_id = input.parent_doc_id
  if (input.position !== undefined) updates.position = input.position
  if (input.status !== undefined) updates.status = input.status

  const result = await db
    .updateTable('documents')
    .set(updates)
    .where('id', '=', id)
    .where('deleted_at', 'is', null)
    .returningAll()
    .executeTakeFirst()

  return result as Document | undefined
}

export async function deleteDocument(id: string): Promise<boolean> {
  const result = await db
    .updateTable('documents')
    .set({ deleted_at: now(), updated_at: now() })
    .where('id', '=', id)
    .where('deleted_at', 'is', null)
    .executeTakeFirst()

  return Number(result.numUpdatedRows) > 0
}

export async function getDocumentHistory(
  documentId: string,
): Promise<DocumentHistory[]> {
  const history = await db
    .selectFrom('document_history')
    .selectAll()
    .where('document_id', '=', documentId)
    .orderBy('created_at', 'desc')
    .execute()

  return history as DocumentHistory[]
}
