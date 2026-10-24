import { loadGoogleScript } from '../auth.jsx'

// Sends email from the signed-in user's own Gmail via the Gmail API.
// Send and read-only access tokens live in memory in this tab and never reach our server.
// Reading is limited to the threads TsunaGo started, to show partners' replies.

const SEND = 'https://www.googleapis.com/auth/gmail.send'
const READ = 'https://www.googleapis.com/auth/gmail.readonly'
const tokens = {} // scope -> { value, expiresAt }

export class GmailError extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
  }
}

function requestToken(clientId, hint, scope) {
  return loadGoogleScript().then((google) => new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope,
      hint,
      callback: (r) => {
        if (r.error || !r.access_token) return reject(new GmailError('denied', 'Gmail permission was not granted.'))
        if (!google.accounts.oauth2.hasGrantedAllScopes(r, scope)) return reject(new GmailError('denied', 'Gmail permission was not granted.'))
        tokens[scope] = { value: r.access_token, expiresAt: Date.now() + (Number(r.expires_in) || 3600) * 1000 - 60_000 }
        resolve(r.access_token)
      },
      error_callback: () => reject(new GmailError('denied', 'The Google permission window was closed.')),
    })
    client.requestAccessToken({ prompt: '' })
  }))
}

async function getToken(clientId, hint, scope) {
  const tok = tokens[scope]
  if (tok && tok.expiresAt > Date.now()) return tok.value
  return requestToken(clientId, hint, scope)
}

// RFC 2822 message, UTF-8 throughout (Japanese subjects need RFC 2047 encoding).
const b64 = (str) => {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((b) => { bin += String.fromCharCode(b) })
  return btoa(bin)
}
const b64url = (s) => b64(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const headerSafe = (s) => String(s).replace(/[\r\n]+/g, ' ').trim()

export function buildRawMessage({ to, subject, body }) {
  const lines = [
    `To: ${headerSafe(to)}`,
    `Subject: =?UTF-8?B?${b64(headerSafe(subject))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    b64(body.replace(/\r?\n/g, '\r\n')).replace(/.{76}/g, '$&\r\n'),
  ]
  return b64url(lines.join('\r\n'))
}

const EMAIL = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/

export async function sendGmail({ clientId, hint, to, subject, body }) {
  if (!clientId) throw new GmailError('not_configured', 'Google sign-in is not configured on this site.')
  if (!EMAIL.test(to)) throw new GmailError('bad_address', 'That email address is not valid.')
  const raw = buildRawMessage({ to, subject, body })
  const send = (accessToken) => fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  })
  let res = await send(await getToken(clientId, hint, SEND))
  if (res.status === 401) {
    delete tokens[SEND]
    res = await send(await getToken(clientId, hint, SEND))
  }
  if (res.status === 403) {
    const detail = await res.json().catch(() => ({}))
    const reason = detail?.error?.errors?.[0]?.reason || detail?.error?.status || ''
    throw new GmailError('forbidden', /disabled|accessNotConfigured|SERVICE_DISABLED/i.test(reason)
      ? 'The Gmail API is not enabled for this Google Cloud project.'
      : 'Gmail refused to send this message.')
  }
  if (res.status === 429) throw new GmailError('rate_limit', 'Gmail sending limit reached — try again later.')
  if (!res.ok) throw new GmailError('api', `Gmail error ${res.status}.`)
  const data = await res.json()
  return { id: data.id, threadId: data.threadId, at: new Date() }
}

// ---------- replies ----------
const fromB64url = (data) => {
  const bin = atob(data.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (ch) => ch.charCodeAt(0)))
}

function plainText(part) {
  if (!part) return ''
  if (part.mimeType === 'text/plain' && part.body?.data) return fromB64url(part.body.data)
  for (const p of part.parts || []) {
    const t = plainText(p)
    if (t) return t
  }
  return ''
}

// Drop the quoted original ("On … wrote:" and "> " lines) so the reply reads cleanly.
export function stripQuoted(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const cut = lines.findIndex((l) => /^On .+wrote:\s*$/.test(l.trim()) || /^-{2,}\s*Original Message/i.test(l.trim()) || /^From: /.test(l.trim()))
  return (cut >= 0 ? lines.slice(0, cut) : lines).filter((l) => !l.startsWith('>')).join('\n').trim()
}

// Replies in the thread we started; reads only that one thread.
export async function fetchReplies({ clientId, hint, threadId, me }) {
  if (!threadId) return []
  const get = (accessToken) => fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${encodeURIComponent(threadId)}?format=full`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  let res = await get(await getToken(clientId, hint, READ))
  if (res.status === 401) {
    delete tokens[READ]
    res = await get(await getToken(clientId, hint, READ))
  }
  if (res.status === 403) throw new GmailError('forbidden', 'Gmail refused to share this thread (check the Gmail API and read permission).')
  if (res.status === 404) return []
  if (!res.ok) throw new GmailError('api', `Gmail error ${res.status}.`)
  const thread = await res.json()
  const header = (m, name) => (m.payload?.headers || []).find((h) => h.name.toLowerCase() === name)?.value || ''
  return (thread.messages || [])
    .filter((m) => !me || !header(m, 'from').toLowerCase().includes(me.toLowerCase()))
    .map((m) => ({
      id: m.id,
      from: header(m, 'from'),
      date: new Date(Number(m.internalDate) || Date.now()),
      snippet: m.snippet || '',
      text: stripQuoted(plainText(m.payload) || m.snippet || '').slice(0, 6000),
    }))
}
