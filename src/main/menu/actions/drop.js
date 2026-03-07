import { isDirectory, isFile } from 'common/filesystem'
import { isMarkdownFile } from 'common/filesystem/paths'
import { PANDOC_EXTENSIONS } from '../../config'
import { normalizeAndResolvePath } from '../../filesystem'

const hasPandocExtension = (pathname) => {
  const lowerPath = pathname.toLowerCase()
  return PANDOC_EXTENSIONS.some((ext) => lowerPath.endsWith(`.${ext.toLowerCase()}`))
}

export const classifyDroppedPaths = (fileList = []) => {
  const seen = new Set()
  const dropped = {
    openPaths: [],
    importPaths: [],
    unsupportedPaths: [],
  }

  for (const file of fileList) {
    if (!file) {
      continue
    }

    const pathname = normalizeAndResolvePath(file)
    if (!pathname || seen.has(pathname)) {
      continue
    }

    seen.add(pathname)

    if (isDirectory(pathname) || isMarkdownFile(pathname)) {
      dropped.openPaths.push(pathname)
      continue
    }

    if (isFile(pathname) && hasPandocExtension(pathname)) {
      dropped.importPaths.push(pathname)
      continue
    }

    dropped.unsupportedPaths.push(pathname)
  }

  return dropped
}
