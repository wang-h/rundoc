import { Hono } from 'hono'
import { getUser } from '../../auth/middleware.js'
import * as documentService from './document.service.js'
import type { CreateDocumentInput, UpdateDocumentInput } from './document.types.js'

const router = new Hono()

// POST /api/projects/:projectId/docs — create a document
router.post('/projects/:projectId/docs', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const { projectId } = c.req.param()
  const body = await c.req.json().catch(() => null)

  if (!body || typeof body.title !== 'string' || !body.title.trim()) {
    return c.json({ error: 'title is required' }, 400)
  }

  const input: CreateDocumentInput = {
    title: body.title.trim(),
    slug_id: body.slug_id,
    content: body.content,
    parent_doc_id: body.parent_doc_id,
    position: body.position,
  }

  try {
    const doc = await documentService.createDocument(
      projectId,
      input,
      user.sub || 'unknown',
    )
    return c.json({ document: doc }, 201)
  } catch (error) {
    console.error('Failed to create document:', error)
    return c.json({ error: 'failed to create document' }, 500)
  }
})

// GET /api/projects/:projectId/docs — list documents for a project
router.get('/projects/:projectId/docs', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const { projectId } = c.req.param()

  try {
    const docs = await documentService.getDocuments(projectId)
    return c.json({ documents: docs })
  } catch (error) {
    console.error('Failed to list documents:', error)
    return c.json({ error: 'failed to list documents' }, 500)
  }
})

// GET /api/projects/:projectId/docs/:docId — get a single document with history
router.get('/projects/:projectId/docs/:docId', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const { docId } = c.req.param()

  try {
    const doc = await documentService.getDocumentById(docId)
    if (!doc) {
      return c.json({ error: 'document not found' }, 404)
    }
    const history = await documentService.getDocumentHistory(docId)
    return c.json({ document: doc, history })
  } catch (error) {
    console.error('Failed to get document:', error)
    return c.json({ error: 'failed to get document' }, 500)
  }
})

// PUT /api/projects/:projectId/docs/:docId — update a document
router.put('/projects/:projectId/docs/:docId', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const { docId } = c.req.param()
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'invalid request body' }, 400)

  const input: UpdateDocumentInput = {}
  if (body.title !== undefined) input.title = body.title
  if (body.slug_id !== undefined) input.slug_id = body.slug_id
  if (body.content !== undefined) input.content = body.content
  if (body.parent_doc_id !== undefined) input.parent_doc_id = body.parent_doc_id
  if (body.position !== undefined) input.position = body.position
  if (body.status !== undefined) input.status = body.status
  if (body.change_summary !== undefined) input.change_summary = body.change_summary

  try {
    const doc = await documentService.updateDocument(
      docId,
      input,
      user.sub || 'unknown',
    )
    if (!doc) {
      return c.json({ error: 'document not found' }, 404)
    }
    return c.json({ document: doc })
  } catch (error) {
    console.error('Failed to update document:', error)
    return c.json({ error: 'failed to update document' }, 500)
  }
})

// DELETE /api/projects/:projectId/docs/:docId — soft delete a document
router.delete('/projects/:projectId/docs/:docId', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const { docId } = c.req.param()

  try {
    const deleted = await documentService.deleteDocument(docId)
    if (!deleted) {
      return c.json({ error: 'document not found' }, 404)
    }
    return c.json({ message: 'document deleted' })
  } catch (error) {
    console.error('Failed to delete document:', error)
    return c.json({ error: 'failed to delete document' }, 500)
  }
})

// GET /api/projects/:projectId/docs/:docId/history — get version history
router.get('/projects/:projectId/docs/:docId/history', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'authentication required' }, 401)

  const { docId } = c.req.param()

  try {
    const history = await documentService.getDocumentHistory(docId)
    return c.json({ history })
  } catch (error) {
    console.error('Failed to get document history:', error)
    return c.json({ error: 'failed to get document history' }, 500)
  }
})

export default router
