import components from 'prismjs/components.js'
import getLoader from 'prismjs/dependencies'
import { getDefer } from '../utils'

// biome-ignore lint/suspicious/noExplicitAny: Prism lacks type declarations
function initLoadLanguage(Prism: any, loadedLanguages: Set<string>) {
  return async function loadLanguages(langs: string | string[]) {
    const { prismLangModules } = await import('./prismLangModules')
    const { languages } = components

    // If no argument is passed, load all components
    if (!langs) {
      langs = Object.keys(languages).filter((lang: string) => lang !== 'meta')
    }

    if (langs && !langs.length) {
      return Promise.reject(new Error('The first parameter should be a list of load languages or single language.'))
    }

    if (!Array.isArray(langs)) {
      langs = [langs]
    }

    const promises: Array<Promise<{ lang: string; status: string }>> = []
    // The user might have loaded languages via some other way or used `prism.js` which already includes some
    // We don't need to validate the ids because `getLoader` will ignore invalid ones
    const loaded = [...loadedLanguages, ...Object.keys(Prism.languages)]

    getLoader(components, langs, loaded).load(async (lang: string) => {
      const defer = getDefer<{ lang: string; status: string }>()
      promises.push(defer.promise)
      if (!(lang in components.languages)) {
        defer.resolve({
          lang,
          status: 'noexist',
        })
      } else if (loadedLanguages.has(lang)) {
        defer.resolve({
          lang,
          status: 'cached',
        })
      } else {
        delete Prism.languages[lang]
        const key = Object.keys(prismLangModules).find((k) => k.endsWith(`/prism-${lang}.js`))
        if (key) {
          await prismLangModules[key]()
        }
        defer.resolve({
          lang,
          status: 'loaded',
        })
        loadedLanguages.add(lang)
      }
    })

    return Promise.all(promises)
  }
}

export default initLoadLanguage
