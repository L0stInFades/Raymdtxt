import { filter } from 'fuzzaldrin'
import { languages } from 'prismjs/components.js'

interface LangEntry {
  name: string
  title?: string
  alias?: string | string[]
  [key: string]: unknown
}

const loadedLanguages = new Set(['markup', 'css', 'clike', 'javascript'])
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
        ...lang.alias.map((alias: string) => ({
          name: alias,
          ...lang,
        })),
      )
    }
  }
}

const transformAliasToOrigin = (inputLangs: string[]): string[] => {
  const result: string[] = []
  for (const lang of inputLangs) {
    if (languages[lang]) {
      result.push(lang)
      continue
    }

    const language = Object.keys(languages).find((name) => {
      const entry = languages[name]
      if (entry.alias) {
        return entry.alias === lang || (Array.isArray(entry.alias) && entry.alias.includes(lang))
      }
      return false
    })

    result.push(language ?? lang)
  }

  return result
}

const search = (text: string) => {
  return filter(langs, text, { key: 'name' })
}

export { loadedLanguages, search, transformAliasToOrigin }
