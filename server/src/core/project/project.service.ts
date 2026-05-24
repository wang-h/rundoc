import { db } from '../../database/db.js'
import type { CreateProjectInput, UpdateProjectInput, Project } from './project.types.js'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function now(): string {
  return new Date().toISOString()
}

export async function createProject(
  input: CreateProjectInput,
  userId: string,
): Promise<Project> {
  const id = crypto.randomUUID()
  const slugId = input.slug_id || generateSlug(input.name)
  const timestamp = now()

  const project: Project = {
    id,
    slug_id: slugId,
    name: input.name,
    description: input.description || '',
    git_repo_url: input.git_repo_url || '',
    workspace_id: input.workspace_id || '',
    org_id: input.org_id || '',
    created_by: userId,
    status: 'active',
    created_at: timestamp,
    updated_at: timestamp,
  }

  await db.insertInto('projects').values(project).execute()
  return project
}

export async function getProjects(filter?: {
  workspaceId?: string
}): Promise<Project[]> {
  let query = db
    .selectFrom('projects')
    .selectAll()
    .where('status', '=', 'active')
    .orderBy('updated_at', 'desc')

  if (filter?.workspaceId) {
    query = query.where('workspace_id', '=', filter.workspaceId)
  }

  return (await query.execute()) as Project[]
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const project = await db
    .selectFrom('projects')
    .selectAll()
    .where('id', '=', id)
    .where('status', '=', 'active')
    .executeTakeFirst()

  return project as Project | undefined
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | undefined> {
  const project = await db
    .selectFrom('projects')
    .selectAll()
    .where('slug_id', '=', slug)
    .where('status', '=', 'active')
    .executeTakeFirst()

  return project as Project | undefined
}

export async function updateProject(
  id: string,
  input: UpdateProjectInput,
): Promise<Project | undefined> {
  const updates: Record<string, string> = {
    updated_at: now(),
  }

  if (input.name !== undefined) updates.name = input.name
  if (input.slug_id !== undefined) updates.slug_id = input.slug_id
  if (input.description !== undefined) updates.description = input.description
  if (input.git_repo_url !== undefined) updates.git_repo_url = input.git_repo_url
  if (input.workspace_id !== undefined) updates.workspace_id = input.workspace_id
  if (input.org_id !== undefined) updates.org_id = input.org_id

  const result = await db
    .updateTable('projects')
    .set(updates)
    .where('id', '=', id)
    .where('status', '=', 'active')
    .returningAll()
    .executeTakeFirst()

  return result as Project | undefined
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await db
    .updateTable('projects')
    .set({ status: 'archived', updated_at: now() })
    .where('id', '=', id)
    .where('status', '=', 'active')
    .executeTakeFirst()

  return Number(result.numUpdatedRows) > 0
}
