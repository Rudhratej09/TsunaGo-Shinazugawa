import { motion } from 'framer-motion'
import { BUDGETS, INDUSTRIES, PRESENCE, PRIORITIES, PROFILES, TIMINGS } from '../data/catalog.js'
import { MODEL_COPY, serviceModel } from '../lib/engine.js'
import { useI18n } from '../i18n.jsx'

export function ProfileStep({ answers, pick, go }) {
  const { t, lang } = useI18n()
  return (
    <div className="page">
      <div className="eyebrow">{t('Step 01 · Profile')}</div>
      <h1 className="h2">{t('Which SME looks like yours?')} {lang === 'en' && <span className="jp" style={{ fontSize: '0.6em' }}>貴社に近いのは</span>}</h1>
      <p className="muted">{t('Start from a preset profile. You can edit every default in the next step.')}</p>
      <div className="grid box profiles">
        {PROFILES.map((p, i) => (
          <motion.button key={p.id} className={`profile ${answers.profile === p.id ? 'on' : ''}`} onClick={() => pick(p)}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <span className="num">0{i + 1}</span>
            <h3>{t(p.title)}</h3>
            {lang === 'en' && <div className="jp small">{p.ja}</div>}
            <p><b style={{ fontWeight: 500 }}>{t(p.need)}.</b> {t(p.blurb)}</p>
          </motion.button>
        ))}
      </div>
      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn" disabled={!answers.profile} onClick={() => go('needs')}>{t('Continue →')}</button>
      </div>
    </div>
  )
}

function Seg({ value, options, onChange }) {
  const { t } = useI18n()
  return (
    <div className="seg" role="radiogroup">
      {options.map((o) => (
        <button key={String(o.id)} role="radio" aria-checked={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>{t(o.label)}</button>
      ))}
    </div>
  )
}

const YESNO = [{ id: true, label: 'Yes' }, { id: false, label: 'No' }]

export function NeedsStep({ answers, set, go }) {
  const { t, lang } = useI18n()
  const model = serviceModel(answers)
  const setPrio = (k, v) => set({ priorities: { ...answers.priorities, [k]: v } })
  return (
    <div className="page">
      <div className="eyebrow">{t('Step 02 · Requirements')}</div>
      <h1 className="h2">{t('Tell TsunaGo what matters')} {lang === 'en' && <span className="jp" style={{ fontSize: '0.6em' }}>優先事項</span>}</h1>
      <p className="muted">{t('Six questions. Each one changes which partners pass the essential checks and what the pilot costs.')}</p>

      <div className="box" style={{ marginTop: 28 }}>
        <div className="grid form" style={{ marginTop: 0 }}>
          <div className="field"><label>{t('Target customer industry')}</label><Seg value={answers.industry} options={INDUSTRIES} onChange={(v) => set({ industry: v })} /></div>
          <div className="field"><label>{t('Entry budget')}</label><Seg value={answers.budget} options={BUDGETS} onChange={(v) => set({ budget: v })} /></div>
          <div className="field"><label>{t('Local installation needed?')}</label><Seg value={answers.localInstall} options={YESNO} onChange={(v) => set({ localInstall: v })} /></div>
          <div className="field"><label>{t('Own service team for India?')}</label><Seg value={answers.ownService} options={YESNO} onChange={(v) => set({ ownService: v })} /></div>
          <div className="field"><label>{t('Existing Indian presence')}</label><Seg value={answers.presence} options={PRESENCE} onChange={(v) => set({ presence: v })} /></div>
          <div className="field"><label>{t('Preferred launch timing')}</label><Seg value={answers.timing} options={TIMINGS} onChange={(v) => set({ timing: v })} /></div>
          <div className="field" style={{ gridColumn: '1 / -1', borderRight: 0, borderBottom: 0 }}><label>{t('Product and use case (optional)')}</label>
            <input className="input" value={answers.product || ''} maxLength={200} placeholder={t('e.g. Inline vision inspection for machined parts')} onChange={(e) => set({ product: e.target.value })} /></div>
        </div>
        <div className="prio">
          <label className="eyebrow" style={{ marginBottom: 8 }}>{t('Partner priorities')}</label>
          {PRIORITIES.map((p) => (
            <div className="prio-row" key={p.id}>
              <div><b>{t(p.label)}</b><span>{t(p.hint)}</span></div>
              <div className="dots" role="radiogroup" aria-label={t(p.label)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} aria-label={`${n} / 5`} className={`${answers.priorities[p.id] >= n ? 'on' : ''} ${p.id === 'technical' && model === 'B' ? 'sakura' : ''}`}
                    onClick={() => setPrio(p.id, n)} />
                ))}
              </div>
              <span className="num">{answers.priorities[p.id]}/5</span>
            </div>
          ))}
        </div>
        <motion.div className="model-callout" key={model} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }}>
          <div className="model-letter">{model}</div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 4 }}>{t('Service model detected')}</div>
            <b style={{ fontWeight: 500 }}>{t(MODEL_COPY[model].title)}</b> — {t('entry route to investigate:')} <b style={{ fontWeight: 500 }}>{t(MODEL_COPY[model].route)}</b>
            <div className="small muted">{model === 'B' ? t('Technical capability is weighted 1.6× and sales-only partners fail the installation check.') : t('Partners are ranked mainly on customer access; your engineer travel is added to the cost model.')}</div>
          </div>
        </motion.div>
      </div>

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn ghost" onClick={() => go('profile')}>{t('← Profile')}</button>
        <button className="btn" onClick={() => go('options')}>{t('Compare my entry options →')}</button>
      </div>
    </div>
  )
}
