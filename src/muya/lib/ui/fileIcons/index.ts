// Because the sidebar also use the file icons, So I put this file out of floatBox directory.
import '@marktext/file-icons/build/index.css'
// @ts-expect-error TS(7016): Could not find a declaration file for module '@mar... Remove this comment to see the full error message
import fileIcons from '@marktext/file-icons'

fileIcons.getClassByName = (name: string) => {
  const icon = fileIcons.matchName(name)

  return icon ? icon.getClass(0, false) : null
}

fileIcons.getClassByLanguage = (lang: string) => {
  const icon = fileIcons.matchLanguage(lang)

  return icon ? icon.getClass(0, false) : null
}

export default fileIcons
