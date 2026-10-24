// Google sign-in (OpenID Connect via Google Identity Services).
// The browser receives a Google-signed ID token; we verify it against Google's public keys,
// then issue our own short session in an HttpOnly cookie. No Google client secret is needed.
import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose'
import { readBody, send } from './llm.js'

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))
const COOKIE = 'tsunago_session'
const SESSION_DAYS = 7

export const authEnabled = (env) => !!env.GOOGLE_CLIENT_ID

const secretKey = (env) => new TextEncoder().encode(env.SESSION_SECRET || '')

export async function verifyGoogleToken(credential, clientId, jwks = GOOGLE_JWKS) {
  const { payload } = await jwtVerify(credential, jwks, {
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    audience: clientId,
  })
  if (!payload.email || payload.email_verified !== true) throw new Error('unverified email')
  return { sub: payload.sub, email: payload.email, name: payload.name || payload.email, picture: payload.picture || '' }
}

function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((p) => p[0]).map(([k, ...v]) => [k, decodeURIComponent(v.join('='))]))
}

const isHttps = (req) => (req.headers['x-forwarded-proto'] || '').split(',')[0] === 'https' || !!req.socket?.encrypted

function setCookie(req, res, value, maxAge) {
  const parts = [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`]
  if (isHttps(req)) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

// Reject cross-site POSTs: the browser always sends Origin on them.
function sameOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return true
  try {
    return new URL(origin).host === req.headers.host
  } catch {
    return false
  }
}

// Optional allow-list, e.g. ALLOWED_EMAILS="a@x.com,@thapar.edu" (a leading @ allows a whole domain).
function allowed(email, env) {
  const list = (env.ALLOWED_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  if (!list.length) return true
  const e = email.toLowerCase()
  return list.some((a) => (a.startsWith('@') ? e.endsWith(a) : e === a))
}

export async function currentUser(req, env) {
  if (!authEnabled(env) || !env.SESSION_SECRET) return null
  const token = cookies(req)[COOKIE]
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, secretKey(env), { issuer: 'tsunago', audience: 'tsunago' })
    return { sub: payload.sub, email: payload.email, name: payload.name, picture: payload.picture }
  } catch {
    return null
  }
}

// Guard for the paid/quota-limited AI routes. Open when sign-in isn't configured (local dev).
export async function requireUser(req, res, env) {
  if (!authEnabled(env)) return true
  if (!sameOrigin(req)) {
    send(res, 403, { error: 'origin', message: 'Cross-site request refused.' })
    return false
  }
  if (await currentUser(req, env)) return true
  send(res, 401, { error: 'signin_required', message: 'Sign in with Google to run the live AI.' })
  return false
}

export async function handleAuth(req, res, env) {
  const action = new URL(req.url, 'http://x').searchParams.get('action')
  if (action === 'me') {
    return send(res, 200, { enabled: authEnabled(env), clientId: env.GOOGLE_CLIENT_ID || null, user: await currentUser(req, env) })
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'method', message: 'Use POST.' })
  if (!sameOrigin(req)) return send(res, 403, { error: 'origin', message: 'Cross-site request refused.' })

  if (action === 'logout') {
    setCookie(req, res, '', 0)
    return send(res, 200, { user: null })
  }
  if (action === 'google') {
    if (!authEnabled(env)) return send(res, 404, { error: 'disabled', message: 'Google sign-in is not configured.' })
    if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) return send(res, 500, { error: 'config', message: 'SESSION_SECRET must be set (32+ characters).' })
    let user
    try {
      const body = await readBody(req)
      user = await verifyGoogleToken(String(body.credential || ''), env.GOOGLE_CLIENT_ID)
    } catch {
      return send(res, 401, { error: 'invalid_token', message: 'Google sign-in could not be verified.' })
    }
    if (!allowed(user.email, env)) return send(res, 403, { error: 'not_allowed', message: 'This Google account is not on the access list.' })
    const session = await new SignJWT({ email: user.email, name: user.name, picture: user.picture })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(user.sub)
      .setIssuer('tsunago')
      .setAudience('tsunago')
      .setIssuedAt()
      .setExpirationTime(`${SESSION_DAYS}d`)
      .sign(secretKey(env))
    setCookie(req, res, session, SESSION_DAYS * 86400)
    return send(res, 200, { user })
  }
  send(res, 404, { error: 'unknown_action', message: 'Unknown auth action.' })
}
