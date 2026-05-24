import { Hono } from 'hono'
import { getUser } from '../../auth/middleware.js'
import * as projectService from './project.service.js'
import type { CreateProjectInput, UpdateProjectInput } from './project.types.js'

const router = new Hono()

// POST /api/projects — create a new project
router.post('/projects', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return c.json({ error: 'name is required' }, 400)
  }

  const input: CreateProjectInput = {
    name: body.name.trim(),
    slug_id: body.slug_id,
    description: body.description,
    git_repo_url: body.git_repo_url,
    workspace_id: body.workspace_id,
    org_id: body.org_id,
  }

  try {
    const project = await projectService.createProject(input, user.sub || 'unknown')
    return c.json({ project }, 201)
  } catch (error) {
    console.error('Failed to create project:', error)
    return c.json({ error: 'failed to create project' }, 500)
  }
})

// GET /api/projects — list projects (optional ?workspace_id filter)
router.get('/projects', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const workspaceId = c.req.query('workspace_id')

  try {
    const projects = await projectService.getProjects({
      workspaceId,
    })
    return c.json({ projects })
  } catch (error) {
    console.error('Failed to list projects:', error)
    return c.json({ error: 'failed to list projects' }, 500)
  }
})

// GET /api/projects/:id — get project by id or slug
router.get('/projects/:id', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const { id } = c.req.param()

  try {
    let project = await projectService.getProjectById(id)
    if (!project) {
      project = await projectService.getProjectBySlug(id)
    }
    if (!project) {
      return c.json({ error: 'project not found' }, 404)
    }
    return c.json({ project })
  } catch (error) {
    console.error('Failed to get project:', error)
    return c.json({ error: 'failed to get project' }, 500)
  }
})

// PUT /api/projects/:id — update a project
router.put('/projects/:id', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const { id } = c.req.param()
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'invalid request body' }, 400)

  const input: UpdateProjectInput = {}
  if (body.name !== undefined) input.name = body.name
  if (body.slug_id !== undefined) input.slug_id = body.slug_id
  if (body.description !== undefined) input.description = body.description
  if (body.git_repo_url !== undefined) input.git_repo_url = body.git_repo_url
  if (body.workspace_id !== undefined) input.workspace_id = body.workspace_id
  if (body.org_id !== undefined) input.org_id = body.org_id

  try {
    const project = await projectService.updateProject(id, input)
    if (!project) {
      return c.json({ error: 'project not found' }, 404)
    }
    return c.json({ project })
  } catch (error) {
    console.error('Failed to update project:', error)
    return c.json({ error: 'failed to update project' }, 500)
  }
})

// DELETE /api/projects/:id — soft delete (archive)
router.delete('/projects/:id', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const { id } = c.req.param()

  try {
    const deleted = await projectService.deleteProject(id)
    if (!deleted) {
      return c.json({ error: 'project not found' }, 404)
    }
    return c.json({ message: 'project archived' })
  } catch (error) {
    console.error('Failed to delete project:', error)
    return c.json({ error: 'failed to delete project' }, 500)
  }
})

export default router
