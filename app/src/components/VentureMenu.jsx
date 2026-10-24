import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  activeVenture, createVenture, deleteVenture, exportVenture, importVenture, listVentures, renameVenture, resetVenture, switchVenture,
} from '../lib/ventures.js'
import { useI18n } from '../i18n.jsx'

const day = (iso) => (iso ? iso.slice(0, 10) : '')

// Header switcher for saved ventures: switch, create, duplicate, rename, start over, delete,
// and export / import a venture as a .tsunago.json file.
export default function VentureMenu() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const current = activeVenture()
  const [name, setName] = useState(current?.name || '')
  const [label, setLabel] = useState(current?.name || '')
  const rename = () => {
    if (!name.trim()) return
    renameVenture(current.id, name)
    setLabel(activeVenture().name)
  }
  const box = useRef(null)
  const file = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onDown = (e) => box.current && !box.current.contains(e.target) && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('mousedown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onDown)
    }
  }, [open])

  const others = listVentures().filter((v) => v.id !== current?.id)

  const create = (copyFrom) => {
    const id = createVenture(copyFrom ? `${current.name} (copy)` : newName, { copyFrom })
    switchVenture(id)
  }
  const download = () => {
    const blob = new Blob([JSON.stringify(exportVenture(current.id), null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${current.name.replace(/[^\w぀-ヿ一-龯-]+/g, '-').toLowerCase() || 'venture'}.tsunago.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }
  const onFile = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setError('')
    try {
      if (f.size > 2_000_000) throw new Error(t('That file is too large to be a venture.'))
      switchVenture(importVenture(await f.text()))
    } catch (err) {
      setError(err.message)
    }
  }
  const startOver = () => {
    if (!window.confirm(t('Clear everything in "{n}" and start again? This cannot be undone.', { n: current.name }))) return
    resetVenture(current.id)
    switchVenture(current.id)
  }
  const remove = () => {
    if (!window.confirm(t('Delete "{n}"? This cannot be undone. Export it first if you may need it.', { n: current.name }))) return
    deleteVenture(current.id)
    switchVenture(activeVenture().id)
  }

  return (
    <div className="venture" ref={box}>
      <button className="venture-btn" onClick={() => { setOpen(!open); setName(current?.name || ''); setError('') }} aria-expanded={open} aria-haspopup="dialog" title={t('Your saved ventures')}>
        <span className="v-icon" aria-hidden="true">▤</span><span className="v-name">{label}</span> ▾
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="venture-panel" role="dialog" aria-label={t('Your saved ventures')}
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
            <div className="mini">{t('Current venture')}</div>
            <div className="v-row">
              <input className="input" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-label={t('Venture name')}
                onKeyDown={(e) => e.key === 'Enter' && rename()} onBlur={rename} />
            </div>
            <div className="v-actions">
              <button className="link small" onClick={() => create(current.id)}>{t('Duplicate (what-if copy)')}</button>
              <button className="link small" onClick={download}>{t('Export file')}</button>
              <button className="link small" onClick={startOver}>{t('Start over')}</button>
              <button className="link small danger" onClick={remove}>{t('Delete')}</button>
            </div>

            {others.length > 0 && (
              <>
                <div className="mini" style={{ marginTop: 16 }}>{t('Switch to')}</div>
                <ul className="v-list">
                  {others.map((v) => (
                    <li key={v.id}><button onClick={() => switchVenture(v.id)}><span>{v.name}</span><span className="small muted">{day(v.updated)}</span></button></li>
                  ))}
                </ul>
              </>
            )}

            <div className="mini" style={{ marginTop: 16 }}>{t('New venture')}</div>
            <form className="v-row" onSubmit={(e) => { e.preventDefault(); create() }}>
              <input className="input" value={newName} maxLength={60} placeholder={t('e.g. CMM maker · Gujarat subsidiary')} onChange={(e) => setNewName(e.target.value)} />
              <button className="btn small-btn" type="submit">{t('Create')}</button>
            </form>
            <button className="link small" style={{ marginTop: 10 }} onClick={() => file.current?.click()}>{t('Import a venture file…')}</button>
            <input ref={file} type="file" accept=".json,application/json" hidden onChange={onFile} />
            {error && <div className="chat-error" style={{ margin: '10px 0 0' }}>{error}</div>}
            <p className="small muted" style={{ margin: '12px 0 0' }}>{t('Ventures are saved in this browser only. Export a file to back one up or share it with your team.')}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
