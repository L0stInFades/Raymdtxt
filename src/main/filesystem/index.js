import { readlinkSync } from 'node:fs'
import { mkdir, writeFile as writeFileFs } from 'node:fs/promises'
import path from 'node:path'
import { isDirectory, isFile, isSymbolicLink } from 'common/filesystem'

/**
 * Normalize the path into an absolute path and resolves the link target if needed.
 *
 * @param {string} pathname The path or link path.
 * @returns {string} Returns the absolute path and resolved link. If the link target
 *                   cannot be resolved, an empty string is returned.
 */
export const normalizeAndResolvePath = (pathname) => {
  if (isSymbolicLink(pathname)) {
    const absPath = path.dirname(pathname)
    const targetPath = path.resolve(absPath, readlinkSync(pathname))
    if (isFile(targetPath) || isDirectory(targetPath)) {
      return path.resolve(targetPath)
    }
    console.error(`Cannot resolve link target "${pathname}" (${targetPath}).`)
    return ''
  }
  return path.resolve(pathname)
}

export const writeFile = (pathname, content, extension, options = 'utf-8') => {
  if (!pathname) {
    return Promise.reject(new Error('[ERROR] Cannot save file without path.'))
  }
  pathname = !extension || pathname.endsWith(extension) ? pathname : `${pathname}${extension}`

  return mkdir(path.dirname(pathname), { recursive: true }).then(() => {
    if (Buffer.isBuffer(content) || content instanceof Uint8Array) {
      return writeFileFs(pathname, content)
    }

    const encoding = options === 'binary' ? 'latin1' : options
    return writeFileFs(pathname, content, encoding)
  })
}
