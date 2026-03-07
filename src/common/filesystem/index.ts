import { existsSync, lstatSync, mkdirSync, readlinkSync } from 'node:fs'
import fsPromises from 'node:fs/promises'
import path from 'node:path'

/**
 * Test whether or not the given path exists.
 */
export const exists = async (p: string): Promise<boolean> => {
  try {
    await fsPromises.access(p)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Ensure that a directory exist.
 */
export const ensureDirSync = (dirPath: string): void => {
  try {
    mkdirSync(dirPath, { recursive: true })
  } catch (e: unknown) {
    if (!(e instanceof Error) || !('code' in e) || e.code !== 'EEXIST') {
      throw e
    }
  }
}

/**
 * Returns true if the path is a directory with read access.
 */
export const isDirectory = (dirPath: string): boolean => {
  try {
    return existsSync(dirPath) && lstatSync(dirPath).isDirectory()
  } catch (_) {
    return false
  }
}

/**
 * Returns true if the path is a directory or a symbolic link to a directory with read access.
 */
export const isDirectory2 = (dirPath: string): boolean => {
  try {
    if (!existsSync(dirPath)) {
      return false
    }

    const fi = lstatSync(dirPath)
    if (fi.isDirectory()) {
      return true
    } else if (fi.isSymbolicLink()) {
      const targetPath = path.resolve(path.dirname(dirPath), readlinkSync(dirPath))
      return isDirectory(targetPath)
    }
    return false
  } catch (_) {
    return false
  }
}

/**
 * Returns true if the path is a file with read access.
 */
export const isFile = (filepath: string): boolean => {
  try {
    return existsSync(filepath) && lstatSync(filepath).isFile()
  } catch (_) {
    return false
  }
}

/**
 * Returns true if the path is a file or a symbolic link to a file with read access.
 */
export const isFile2 = (filepath: string): boolean => {
  try {
    if (!existsSync(filepath)) {
      return false
    }

    const fi = lstatSync(filepath)
    if (fi.isFile()) {
      return true
    } else if (fi.isSymbolicLink()) {
      const targetPath = path.resolve(path.dirname(filepath), readlinkSync(filepath))
      return isFile(targetPath)
    }
    return false
  } catch (_) {
    return false
  }
}

/**
 * Returns true if the path is a symbolic link with read access.
 */
export const isSymbolicLink = (filepath: string): boolean => {
  try {
    return existsSync(filepath) && lstatSync(filepath).isSymbolicLink()
  } catch (_) {
    return false
  }
}
