import fs from 'node:fs'
import path from 'node:path'
import { filter } from 'fuzzaldrin'
import log from 'electron-log'
import { isDirectory, isFile } from 'common/filesystem'
import { IMAGE_EXTENSIONS } from 'common/filesystem/paths'
import { BLACK_LIST } from '../config'

interface FileEntry {
  file: string
  type: string
}

const IMAGE_PATH = new Map<string, FileEntry[]>()
export const watchers = new Map<string, fs.FSWatcher>()

const filesHandler = (files: string[], directory: string, key?: string): FileEntry[] | undefined => {
  const IMAGE_REG = new RegExp(`(${IMAGE_EXTENSIONS.join('|')})$`, 'i')
  const onlyDirAndImage = files
    .map((file) => {
      const fullPath = path.join(directory, file)
      let type = ''
      if (isDirectory(fullPath)) {
        type = 'directory'
      } else if (isFile(fullPath) && IMAGE_REG.test(file)) {
        type = 'image'
      }
      return {
        file,
        type,
      }
    })
    .filter(({ file, type }) => {
      if (BLACK_LIST.includes(file)) return false
      return type === 'directory' || type === 'image'
    })

  IMAGE_PATH.set(directory, onlyDirAndImage)
  if (key !== undefined) {
    return filter(onlyDirAndImage, key, {
      key: 'file',
    })
  }
}

const rebuild = (directory: string): void => {
  fs.readdir(directory, (err, files) => {
    if (err) {
      log.error('imagePathAutoComplement::rebuild:', err)
    } else {
      filesHandler(files, directory)
    }
  })
}

const watchDirectory = (directory: string): void => {
  if (watchers.has(directory)) return
  const watcher = fs.watch(directory, (eventType, _filename) => {
    if (eventType === 'rename') {
      rebuild(directory)
    }
  })
  watchers.set(directory, watcher)
}

export const searchFilesAndDir = (directory: string, key: string): Promise<FileEntry[] | undefined> => {
  let result: FileEntry[] = []
  if (IMAGE_PATH.has(directory)) {
    result = filter(IMAGE_PATH.get(directory)!, key, { key: 'file' })
    return Promise.resolve(result)
  } else {
    return new Promise((resolve, reject) => {
      fs.readdir(directory, (err, files) => {
        if (err) {
          reject(err)
        } else {
          result = filesHandler(files, directory, key) as FileEntry[]
          watchDirectory(directory)
          resolve(result)
        }
      })
    })
  }
}
