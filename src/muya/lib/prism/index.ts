import Prism from 'prismjs'
import { filter } from 'fuzzaldrin'
import initLoadLanguage, { loadedLanguages, transformAliasToOrigin } from './loadLanguage'
import { languages } from 'prismjs/components.js'

interface LangEntry {
  name: string;
  title?: string;
  alias?: string | string[];
  [key: string]: unknown;
}

const prism = Prism
;(window as unknown as Record<string, unknown>).Prism = Prism
/* eslint-disable */
import('prismjs/plugins/keep-markup/prism-keep-markup')
/* eslint-enable */
const langs: LangEntry[] = []

for (const name of Object.keys(languages)) {
  const lang = languages[name]
  langs.push({
    name,
    ...lang,
  })
  if (lang.alias) {
    if (typeof lang.alias === 'string') {
      langs.push({
        name: lang.alias,
        ...lang,
      })
    } else if (Array.isArray(lang.alias)) {
      langs.push(
        ...lang.alias.map((a: string) => ({
          name: a,
          ...lang
        })),
      )
    }
  }
}

const loadLanguage = initLoadLanguage(Prism)

const search = (text: string) => {
  return filter(langs, text, { key: 'name' })
}

// pre load latex and yaml and html for `math block` \ `front matter` and `html block`
loadLanguage('latex')
loadLanguage('yaml')

export { search, loadLanguage, loadedLanguages, transformAliasToOrigin }

export default prism
