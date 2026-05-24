import * as jose from 'jose'

const config = {
  get issuer() { return process.env.RUNID_ISSUER || 'http://localhost:4100' },
  get clientId() { return process.env.RUNID_CLIENT_ID || 'rundoc' },
  get clientSecret() { return process.env.RUNID_CLIENT_SECRET || 'dev-secret-rundoc' },
  get redirectUri() { return process.env.RUNID_REDIRECT_URI || 'http://localhost:5174/auth/callback' },
  get postLogoutRedirectUri() { return process.env.RUNID_POST_LOGOUT_REDIRECT_URI || 'http://localhost:5174' },
  get sessionSecret() { return process.env.SESSION_SECRET || 'dev-session-secret-change-in-production' },
  get authMode() { return process.env.AUTH_MODE || 'oidc' },
}

let cachedDiscovery: any = null

export async function getDiscovery() {
  if (cachedDiscovery) return cachedDiscovery
  const res = await fetch(`${config.issuer}/.well-known/openid-configuration`)
  if (!res.ok) throw new Error('Failed to fetch OIDC discovery')
  cachedDiscovery = await res.json()
  return cachedDiscovery!
}

let cachedJWKS: ReturnType<typeof jose.createLocalJWKSet> | null = null

export async function getJWKS() {
  if (cachedJWKS) return cachedJWKS
  const discovery = await getDiscovery()
  const res = await fetch(discovery.jwks_uri || `${discovery.issuer}/.well-known/jwks.json`)
  if (!res.ok) throw new Error(`JWKS fetch failed: HTTP ${res.status}`)
  const jwksData = await res.json()
  if (!jwksData || !Array.isArray(jwksData.keys)) {
    throw new Error('JWKS malformed: missing keys array')
  }
  cachedJWKS = jose.createLocalJWKSet(jwksData)
  return cachedJWKS
}

export interface IdTokenClaims {
  sub: string
  name?: string
  email?: string
  email_verified?: boolean
  realm?: string
  org_id?: string
  identity_type?: string
  role?: string
  roles?: string[]
  badges?: { label: string; color: string }[]
  permissions?: string[]
  avatar?: string
  is_admin?: boolean
  [key: string]: unknown
}

let sessionSecretKey: Uint8Array | null = null

function getSessionSecretKey() {
  if (!sessionSecretKey) sessionSecretKey = new TextEncoder().encode(config.sessionSecret)
  return sessionSecretKey
}

export async function createSessionCookie(user: IdTokenClaims): Promise<string> {
  const key = getSessionSecretKey()
  return await new jose.SignJWT({
    sub: user.sub, name: user.name, email: user.email,
    email_verified: user.email_verified,
    role: user.role ?? user.roles?.[0],
    org_id: user.org_id, identity_type: user.identity_type,
    badges: user.badges, permissions: user.permissions,
    avatar: user.avatar, is_admin: user.is_admin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt().setExpirationTime('24h')
    .sign(key)
}

export async function verifySessionCookie(token: string): Promise<IdTokenClaims | null> {
  try {
    const key = getSessionSecretKey()
    const { payload } = await jose.jwtVerify(token, key, { algorithms: ['HS256'] })
    return payload as unknown as IdTokenClaims
  } catch { return null }
}

export function generatePKCE() {
  const codeVerifier = Array.from(crypto.getRandomValues(new Uint8Array(64)),
    (b) => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'[b % 66]
  ).join('')
  return { codeVerifier }
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function exchangeCode(code: string, codeVerifier: string): Promise<{
  idToken: string; accessToken: string; claims: IdTokenClaims
}> {
  const discovery = await getDiscovery()
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code, redirect_uri: config.redirectUri,
    client_id: config.clientId, client_secret: config.clientSecret,
    code_verifier: codeVerifier,
  })
  const res = await fetch(discovery.token_endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error(`Token exchange failed: ${await res.text()}`)
  const data = await res.json() as { access_token: string; id_token: string }
  const jwks = await getJWKS()
  const { payload } = await jose.jwtVerify(data.id_token, jwks, {
    issuer: discovery.issuer, audience: config.clientId,
  })
  return { idToken: data.id_token, accessToken: data.access_token, claims: payload as unknown as IdTokenClaims }
}

export { config }
