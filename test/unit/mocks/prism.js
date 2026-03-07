const loadedLanguages = new Set(['markup', 'css', 'clike', 'javascript'])

const loadLanguage = async (langs) => {
  const normalizedLangs = Array.isArray(langs) ? langs : [langs]
  return normalizedLangs.filter(Boolean).map((lang) => {
    const status = loadedLanguages.has(lang) ? 'cached' : 'loaded'
    loadedLanguages.add(lang)
    return { lang, status }
  })
}

const search = () => []

const transformAliasToOrigin = (langs) => langs

export { loadedLanguages, loadLanguage, search, transformAliasToOrigin }

export default {}
