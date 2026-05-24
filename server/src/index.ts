import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import authRoutes from './auth/routes.js'
import { authMiddleware } from './auth/middleware.js'
import projectRoutes from './core/project/project.routes.js'
import documentRoutes from './core/document/document.routes.js'
import { db } from './database/db.js'
import { migrateToLatest } from './database/migrate.js'

const app = new Hono()
app.use('*', cors())
app.use('*', logger())

app.get('/health', (c) => c.json({ status: 'ok', service: 'rundoc-server' }))

app.route('/auth', authRoutes)

// Protected API routes
app.use('/api/*', authMiddleware())
app.get('/api/me', (c) => c.json((c as any).get('user')))

app.route('/api', projectRoutes)
app.route('/api', documentRoutes)

const port = parseInt(process.env.PORT || '3191')

// Run migrations then start server
console.log('Running database migrations...')
migrateToLatest(db)
  .then(() => {
    console.log('Migrations complete.')
    serve({ fetch: app.fetch, port }, () => {
      console.log(`RunDoc Server running on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('Failed to run migrations:', err)
    process.exit(1)
  })

export default app
