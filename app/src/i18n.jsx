import { createContext, useContext } from 'react'
import { translate } from './i18n-core.js'

const LangContext = createContext({ lang: 'en', setLang: () => {} })

export const LangProvider = LangContext.Provider

export function useI18n() {
  const { lang, setLang } = useContext(LangContext)
  const t = (s, vars) => translate(lang, s, vars)
  // tm renders a msg() object from the engine.
  return { lang, setLang, t, tm: (m) => (m ? translate(lang, m.t, m.v) : '') }
}
