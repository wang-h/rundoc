import { sql, type Kysely } from 'kysely'
import type { Database } from '../types.js'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('documents')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('slug_id', 'text', (col) => col.notNull())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('content', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('project_id', 'text', (col) => col.notNull().references('projects.id'))
    .addColumn('parent_doc_id', 'text')
    .addColumn('position', 'text', (col) => col.notNull().defaultTo('a0'))
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('draft'))
    .addColumn('last_updated_by', 'text', (col) => col.notNull())
    .addColumn('created_at', 'text', (col) => col.notNull())
    .addColumn('updated_at', 'text', (col) => col.notNull())
    .addColumn('deleted_at', 'text')
    .execute()

  await db.schema
    .createTable('document_history')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('document_id', 'text', (col) => col.notNull().references('documents.id'))
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('content', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('changed_by', 'text', (col) => col.notNull())
    .addColumn('change_summary', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('created_at', 'text', (col) => col.notNull())
    .execute()

  await sql`CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id)`.execute(db)
  await sql`CREATE INDEX IF NOT EXISTS idx_documents_slug_id ON documents(slug_id)`.execute(db)
  await sql`CREATE INDEX IF NOT EXISTS idx_documents_parent_doc_id ON documents(parent_doc_id)`.execute(db)
  await sql`CREATE INDEX IF NOT EXISTS idx_document_history_document_id ON document_history(document_id)`.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('document_history').ifExists().execute()
  await db.schema.dropTable('documents').ifExists().execute()
}
