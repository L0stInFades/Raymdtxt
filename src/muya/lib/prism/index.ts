import prism from './runtime'
import { loadedLanguages, search, transformAliasToOrigin } from './metadata'

let lazyLoadLanguage: ((langs: string | string[]) => Promise<Array<{ lang: string; status: string }>>) | null = null

const ensureLoadLanguage = async () => {
  if (!lazyLoadLanguage) {
    const { default: initLoadLanguage } = await import('./loadLanguage')
    lazyLoadLanguage = initLoadLanguage(prism, loadedLanguages)
  }

  return lazyLoadLanguage
}

const loadLanguage = async (langs: string | string[]) => {
  const loader = await ensureLoadLanguage()
  return loader(langs)
}

export { search, loadLanguage, loadedLanguages, transformAliasToOrigin }

export default prism
