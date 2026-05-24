import { sql, type Kysely } from 'kysely'
import type { Database } from '../types.js'

export async function up(db: Kysely<Database>): Promise<void> {
  await db.schema
    .createTable('projects')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey().notNull())
    .addColumn('slug_id', 'text', (col) => col.notNull().unique())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('description', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('git_repo_url', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('workspace_id', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('org_id', 'text', (col) => col.notNull().defaultTo(''))
    .addColumn('created_by', 'text', (col) => col.notNull())
    .addColumn('status', 'text', (col) => col.notNull().defaultTo('active'))
    .addColumn('created_at', 'text', (col) => col.notNull())
    .addColumn('updated_at', 'text', (col) => col.notNull())
    .execute()

  await sql`CREATE INDEX IF NOT EXISTS idx_projects_slug_id ON projects(slug_id)`.execute(db)
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON projects(workspace_id)`.execute(db)
  await sql`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`.execute(db)
}

export async function down(db: Kysely<Database>): Promise<void> {
  await db.schema.dropTable('projects').ifExists().execute()
}
