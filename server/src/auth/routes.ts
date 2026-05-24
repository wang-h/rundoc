import { Hono } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { config, getDiscovery, generatePKCE, generateCodeChallenge, exchangeCode, createSessionCookie } from './oidc.js'
import { getUser } from './middleware.js'

const router = new Hono()

router.get('/login', async (c) => {
  if (config.authMode === 'local') return c.redirect('/')
  const discovery = await getDiscovery()
  const { codeVerifier } = generatePKCE()
  const challenge = await generateCodeChallenge(codeVerifier)
  const state = crypto.randomUUID()
  const nonce = crypto.randomUUID()

  setCookie(c, 'rundoc_oidc_state', JSON.stringify({ state, codeVerifier, nonce }), {
    httpOnly: true, secure: false, sameSite: 'Lax', path: '/', maxAge: 600,
  })

  const params = new URLSearchParams({
    response_type: 'code', client_id: config.clientId,
    redirect_uri: config.redirectUri, scope: 'openid profile email',
    state, nonce, code_challenge: challenge, code_challenge_method: 'S256',
  })
  return c.redirect(`${discovery.authorization_endpoint}?${params.toString()}`)
})

router.get('/callback', async (c) => {
  if (config.authMode === 'local') return c.redirect('/')
  const code = c.req.query('code')
  const returnedState = c.req.query('state')
  if (!code) return c.json({ error: 'missing authorization code' }, 400)

  const stateCookie = getCookie(c, 'rundoc_oidc_state')
  if (!stateCookie) return c.json({ error: 'session expired' }, 400)

  let storedState: { state: string; codeVerifier: string; nonce: string }
  try { storedState = JSON.parse(stateCookie) } catch { return c.json({ error: 'invalid session' }, 400) }
  if (returnedState !== storedState.state) return c.json({ error: 'state mismatch' }, 400)

  deleteCookie(c, 'rundoc_oidc_state')
  try {
    const { claims } = await exchangeCode(code, storedState.codeVerifier)
    const sessionToken = await createSessionCookie(claims)
    setCookie(c, 'rundoc_session', sessionToken, {
      httpOnly: true, secure: process.env.SESSION_COOKIE_SECURE === 'true',
      sameSite: 'Lax', path: '/', maxAge: 86400,
    })
    return c.redirect('/')
  } catch (err) {
    console.error('OIDC callback error:', err)
    return c.json({ error: 'authentication failed' }, 500)
  }
})

router.get('/logout', async (c) => {
  deleteCookie(c, 'rundoc_session')
  deleteCookie(c, 'rundoc_oidc_state')
  if (config.authMode === 'local') return c.redirect('/')
  try {
    const discovery = await getDiscovery()
    const params = new URLSearchParams({
      post_logout_redirect_uri: config.postLogoutRedirectUri,
      client_id: config.clientId,
    })
    return c.redirect(`${discovery.end_session_endpoint}?${params.toString()}`)
  } catch { return c.redirect('/') }
})

router.get('/me', async (c) => {
  const user = getUser(c)
  if (!user) return c.json({ error: 'not authenticated' }, 401)
  return c.json(user)
})

export default router
