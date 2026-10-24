// Saved ventures: every piece of plan data lives under the active venture, so an SME can keep
// several India plans (or what-if copies) side by side. Language and petals stay app-wide.
// All storage access is wrapped: in private mode or with storage blocked the app still works
// for the current visit, it just cannot remember.

const REGISTRY = 'tsunago-ventures'
const prefix = (id) => `tsunago-v:${id}:`
// Data that belongs to a venture (key names without the prefix).
export const VENTURE_KEYS = ['answers', 'shortlist', 'visited', 'partners-custom', 'advisor-profile', 'advisor-chat',
  'compliance', 'compliance-cur', 'compliance-signoff', 'coach', 'coach-form', 'negotiate', 'negotiate-form']

const raw = {
  get(k) { try { return localStorage.getItem(k) } catch { return null } },
  set(k, v) { try { localStorage.setItem(k, v); return true } catch { return false } },
  del(k) { try { localStorage.removeItem(k) } catch { /* storage unavailable */ } },
}
const parse = (s, fallback) => { try { return s == null ? fallback : JSON.parse(s) } catch { return fallback } }
const newId = () => Math.random().toString(36).slice(2, 10)
const now = () => new Date().toISOString()

function readRegistry() {
  const reg = parse(raw.get(REGISTRY), null)
  if (reg && Array.isArray(reg.list) && reg.list.length && reg.list.some((v) => v.id === reg.active)) return reg
  // First run (or a broken registry): adopt any data saved before ventures existed.
  const id = newId()
  const fresh = { active: id, list: [{ id, name: 'My first venture', created: now(), updated: now() }] }
  VENTURE_KEYS.forEach((k) => {
    const old = raw.get(`tsunago-${k}`)
    if (old != null) {
      raw.set(prefix(id) + k, old)
      raw.del(`tsunago-${k}`)
    }
  })
  raw.set(REGISTRY, JSON.stringify(fresh))
  return fresh
}

let registry = readRegistry()
const saveRegistry = () => raw.set(REGISTRY, JSON.stringify(registry))

export const listVentures = () => registry.list
export const activeVenture = () => registry.list.find((v) => v.id === registry.active)

// Read / write data for the active venture.
export function vget(key, fallback) {
  return parse(raw.get(prefix(registry.active) + key), fallback)
}
export function vset(key, value) {
  raw.set(prefix(registry.active) + key, JSON.stringify(value))
  const v = activeVenture()
  if (v) {
    v.updated = now()
    saveRegistry()
  }
}

// Switching reloads the page so every screen reads the new venture's data from scratch.
export function switchVenture(id) {
  if (!registry.list.some((v) => v.id === id)) return
  registry.active = id
  saveRegistry()
  window.location.reload()
}

export function createVenture(name, { copyFrom } = {}) {
  const id = newId()
  registry.list.push({ id, name: (name || '').trim().slice(0, 60) || `Venture ${registry.list.length + 1}`, created: now(), updated: now() })
  if (copyFrom) VENTURE_KEYS.forEach((k) => {
    const s = raw.get(prefix(copyFrom) + k)
    if (s != null) raw.set(prefix(id) + k, s)
  })
  saveRegistry()
  return id
}

export function renameVenture(id, name) {
  const v = registry.list.find((x) => x.id === id)
  if (!v || !name.trim()) return
  v.name = name.trim().slice(0, 60)
  saveRegistry()
}

export function deleteVenture(id) {
  VENTURE_KEYS.forEach((k) => raw.del(prefix(id) + k))
  registry.list = registry.list.filter((v) => v.id !== id)
  if (!registry.list.length) {
    const fresh = newId()
    registry.list.push({ id: fresh, name: 'My first venture', created: now(), updated: now() })
  }
  const wasActive = registry.active === id
  if (wasActive) registry.active = registry.list[0].id
  saveRegistry()
  return wasActive
}

// Clear one venture's data but keep it in the list.
export function resetVenture(id) {
  VENTURE_KEYS.forEach((k) => raw.del(prefix(id) + k))
  const v = registry.list.find((x) => x.id === id)
  if (v) v.updated = now()
  saveRegistry()
}

// ---------- Export / import (.tsunago.json) ----------
const FORMAT = 'tsunago-venture'

export function exportVenture(id) {
  const v = registry.list.find((x) => x.id === id)
  const data = {}
  VENTURE_KEYS.forEach((k) => {
    const s = raw.get(prefix(id) + k)
    if (s != null) data[k] = parse(s, null)
  })
  return { format: FORMAT, version: 1, name: v?.name || 'Venture', exported: now(), data }
}

// Returns the new venture's id, or throws with a message the UI can show.
export function importVenture(json) {
  const obj = typeof json === 'string' ? parse(json, null) : json
  if (!obj || obj.format !== FORMAT || typeof obj.data !== 'object' || obj.data === null) throw new Error('This is not a TsunaGo venture file.')
  if (obj.version > 1) throw new Error('This file was made by a newer version of TsunaGo.')
  const id = createVenture(`${String(obj.name || 'Imported venture').slice(0, 48)} (imported)`)
  VENTURE_KEYS.forEach((k) => {
    if (k in obj.data) raw.set(prefix(id) + k, JSON.stringify(obj.data[k]))
  })
  return id
}
