import type { Context, Next } from 'hono'
import { getCookie, deleteCookie } from 'hono/cookie'
import { verifySessionCookie, config, type IdTokenClaims } from './oidc.js'

export function authMiddleware() {
  return async (c: Context, next: Next) => {
    if (config.authMode === 'local') {
      c.set('user', {
        sub: 'local-dev', name: 'Developer', email: 'dev@localhost',
        email_verified: true, role: 'admin',
        badges: [{ label: 'Core', color: 'blue' }],
        permissions: ['read', 'write', 'admin'], is_admin: true,
      })
      return next()
    }
    const token = getCookie(c, 'rundoc_session')
    if (!token) return c.json({ error: 'authentication required' }, 401)
    const user = await verifySessionCookie(token)
    if (!user) {
      deleteCookie(c, 'rundoc_session')
      return c.json({ error: 'invalid or expired session' }, 401)
    }
    c.set('user', user)
    return next()
  }
}

export function getUser(c: Context): IdTokenClaims | undefined {
  return c.get('user')
}
