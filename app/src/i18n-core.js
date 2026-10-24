import { JA } from './i18n-ja.js'

// English strings are the keys; JA maps them to Japanese. Missing keys fall back to English.
// `{name}` placeholders are filled from vars; a var value that is itself a key is translated too.
export function translate(lang, s, vars) {
  const tr = (x) => (lang === 'ja' && JA[x] ? JA[x] : x)
  let out = tr(s)
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, tr(String(v)))
  return out
}

// A translatable message: template + vars, rendered later in the viewer's language.
export const msg = (t, v) => ({ t, v })
export const en = (m) => translate('en', m.t, m.v)
