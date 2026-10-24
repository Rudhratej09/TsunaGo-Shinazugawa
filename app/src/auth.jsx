import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

// Client side of Google sign-in. The server decides whether sign-in is enabled
// (GOOGLE_CLIENT_ID set) and owns the session cookie; this only renders Google's button
// and hands its ID token to /api/auth.

const AuthContext = createContext({ enabled: false, user: null, ready: false })

let gisPromise
let initializedFor = null
export function loadGoogleScript() {
  gisPromise ||= new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve(window.google)
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = () => resolve(window.google)
    s.onerror = () => {
      gisPromise = null
      reject(new Error('Could not load Google sign-in.'))
    }
    document.head.appendChild(s)
  })
  return gisPromise
}

async function authCall(action, body) {
  const res = await fetch(`/api/auth?action=${action}`, body === undefined
    ? { credentials: 'same-origin' }
    : { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Sign-in failed (${res.status}).`)
  return data
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ enabled: false, clientId: null, user: null, ready: false, error: '' })

  useEffect(() => {
    authCall('me')
      .then((d) => setState({ enabled: d.enabled, clientId: d.clientId, productionHost: d.productionHost, user: d.user, ready: true, error: '' }))
      .catch(() => setState((s) => ({ ...s, ready: true })))
  }, [])

  const onCredential = useCallback(async ({ credential }) => {
    try {
      const d = await authCall('google', { credential })
      setState((s) => ({ ...s, user: d.user, error: '' }))
    } catch (e) {
      setState((s) => ({ ...s, error: e.message }))
    }
  }, [])

  const signOut = useCallback(async () => {
    await authCall('logout', {}).catch(() => {})
    window.google?.accounts?.id?.disableAutoSelect()
    setState((s) => ({ ...s, user: null }))
  }, [])

  return <AuthContext.Provider value={{ ...state, onCredential, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

// Google's own rendered button (required by Google's branding rules).
export function GoogleButton({ lang = 'en', size = 'medium' }) {
  const { clientId, onCredential, productionHost } = useAuth()
  const ref = useRef(null)
  const [failed, setFailed] = useState(false)
  // On a preview / per-deployment URL Google would answer "origin_mismatch".
  const elsewhere = productionHost && window.location.host !== productionHost && !/^(localhost|127\.)/.test(window.location.hostname)

  useEffect(() => {
    if (!clientId || elsewhere) return
    let cancelled = false
    loadGoogleScript()
      .then((google) => {
        if (cancelled || !ref.current) return
        // Initialise once per page even when several buttons are on screen.
        if (initializedFor !== clientId) {
          google.accounts.id.initialize({ client_id: clientId, callback: onCredential, ux_mode: 'popup' })
          initializedFor = clientId
        }
        google.accounts.id.renderButton(ref.current, { theme: 'outline', size, shape: 'rectangular', text: 'signin_with', locale: lang })
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [clientId, onCredential, lang, size, elsewhere])

  if (!clientId) return null
  if (elsewhere) {
    const href = `https://${productionHost}/${window.location.hash}`
    return <a className="small gbtn-link" href={href}>{lang === 'ja' ? 'サインインは本番サイトで →' : 'Sign in on the main site →'}</a>
  }
  return failed ? <span className="small muted">Google sign-in unavailable</span> : <div ref={ref} className="gbtn" />
}

export function UserMenu({ t }) {
  const { user, signOut } = useAuth()
  if (!user) return null
  return (
    <span className="user-menu">
      {user.picture ? <img src={user.picture} alt="" referrerPolicy="no-referrer" /> : <span className="avatar">{user.name[0]}</span>}
      <span className="user-name" title={user.email}>{user.name.split(' ')[0]}</span>
      <button className="link small" onClick={signOut}>{t('Sign out')}</button>
    </span>
  )
}
