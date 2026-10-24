import { motion } from 'framer-motion'
import { buildPlan, industryLabel, MODEL_COPY } from '../lib/engine.js'
import { useI18n } from '../i18n.jsx'

const OWNERS = { HQ: 'Your HQ (Japan)', Partner: 'Local partner', Expert: 'Expert review', TsunaGo: 'TsunaGo' }

export default function Plan({ answers, result, shortlist, open, go }) {
  const { t, lang } = useI18n()
  const tv = (vars) => vars && Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, t(String(v))]))
  const chosen = shortlist.length
    ? result.partners.filter((p) => shortlist.includes(p.id))
    : result.partners.filter((p) => p.eligible).slice(0, 2)
  const plan = buildPlan(answers, chosen, result.clusters)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(plan.weeks * f))
  const openChecks = chosen.flatMap((p) => p.open)

  return (
    <div className="page">
      <div className="results-head">
        <div>
          <div className="eyebrow">{t('Step 04 · Pilot plan')}</div>
          <h1 className="h2">{t('Plan the first pilot')} {lang === 'en' && <span className="jp" style={{ fontSize: '0.6em' }}>パイロット計画</span>}</h1>
          <p className="muted" style={{ margin: 0 }}>
            {t(industryLabel(answers.industry))} · {t('model')} {plan.model} ({t(MODEL_COPY[plan.model].route)}) · {t(plan.region.name)} · {t('{n} weeks', { n: plan.weeks })}
          </p>
        </div>
        <button className="btn ghost no-print" onClick={() => window.print()}>{t('Export brief (PDF)')}</button>
      </div>

      <div className="box" style={{ marginTop: 26 }}>
        <div className="list-head"><span className="h3">{t('Shortlist')}</span>
          <span className="small muted">{shortlist.length ? t('Your picks') : t('Auto-selected top two — tap ✿ on the options page to choose your own')}</span></div>
        {chosen.map((p) => (
          <button key={p.id} className="row partner-row" onClick={() => open('partner', p)}>
            <span className="rank" style={{ color: 'var(--sakura-deep)' }}>✿</span>
            <span><span className="name">{p.name}</span><span className="meta">{t(p.type)} · {p.hq.city}</span></span>
            <div className="bar hide-sm"><i style={{ width: `${p.score}%` }} /></div>
            <span className="pips hide-sm">{p.checks.map((c) => <span key={c.id} className={`pip ${c.status}`} />)}</span>
            <span className="score">{p.score}</span><span />
          </button>
        ))}
      </div>

      <div className="box gantt">
        <div className="g-scale"><div style={{ padding: '8px 20px' }}>{t('Milestone · owner')}</div>
          <div>{ticks.map((wk, i) => <span key={wk} style={{ left: `${(wk / plan.weeks) * 100}%`, transform: `translateX(${i === 0 ? 0 : i === ticks.length - 1 ? -100 : -50}%)` }}>{t('wk {n}', { n: wk })}</span>)}</div></div>
        {plan.steps.map((s, i) => (
          <div className="g-row" key={s.title + s.from}>
            <div className="g-label"><b>{t(s.title, tv(s.vars))}</b><span>{t(OWNERS[s.owner])} · {t('wk {n}', { n: `${s.from}–${s.to}` })}</span></div>
            <div className="g-track"><div style={{ position: 'relative', height: '100%' }}>
              <motion.div className={`g-bar ${s.owner}`} title={t(s.detail, tv(s.vars))}
                style={{ left: `${(s.from / plan.weeks) * 100}%`, width: `${Math.max(2, ((s.to - s.from) / plan.weeks) * 100)}%` }}
                initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.1 + i * 0.08, duration: 0.6 }} />
            </div></div>
          </div>
        ))}
        <div className="map-legend" style={{ borderTop: '1px solid var(--ink)' }}>
          {Object.entries(OWNERS).map(([k, v]) => <span key={k}><i className={`g-bar ${k}`} style={{ position: 'static', transform: 'none', display: 'inline-block', width: 18, height: 10 }} />{t(v)}</span>)}
        </div>
      </div>

      <div className="two" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="box">
          <div className="list-head"><span className="h3">{t('Open checks before contracting')}</span><span className="num">{openChecks.length}</span></div>
          {openChecks.length === 0 && <p className="cell muted">{t('Nothing open — confirm terms in writing.')}</p>}
          {openChecks.map((o, i) => (
            <div className="check" key={i} style={{ padding: '12px 20px' }}>
              <span className="pip warn" style={{ marginTop: 5 }} />
              <div><b>{o.fact}</b><p>{o.partner} · {t(o.source)}</p></div>
            </div>
          ))}
        </div>
        <div className="box">
          <div className="list-head"><span className="h3">{t('Sustain · review-gate KPIs')}</span></div>
          {plan.kpis.map((k) => (
            <div className="check" key={k.label} style={{ padding: '12px 20px', gridTemplateColumns: '1fr auto' }}>
              <b>{t(k.label)}</b><span className="num" style={{ color: 'var(--ink)' }}>{k.target}</span>
            </div>
          ))}
          <p className="small muted" style={{ padding: '0 20px 16px', margin: 0 }}>
            {t('TsunaGo tracks service commitments and partner follow-through monthly, so expansion decisions rest on data.')}
          </p>
        </div>
      </div>

      <p className="small muted" style={{ marginTop: 22 }}>{t('Legal, tax and compliance steps remain expert-reviewed tasks. TsunaGo prepares the brief; qualified advisers sign off.')}</p>
      <div className="no-print" style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn ghost" onClick={() => go('options')}>{t('← Entry options')}</button>
        <button className="btn" onClick={() => go('why')}>{t('Why TsunaGo →')}</button>
      </div>
    </div>
  )
}
