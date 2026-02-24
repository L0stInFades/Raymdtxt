import path from 'node:path'
import crypto from 'node:crypto'
import fs from 'fs-extra'
import { statSync, constants } from 'node:fs'
import cp from 'node:child_process'
import { tmpdir } from 'node:os'
import dayjs from 'dayjs'
import { Octokit } from '@octokit/rest'
import { isImageFile } from 'common/filesystem/paths'
import { isWindows } from './index'

export const create = async (pathname: string, type: string): Promise<void> => {
  return type === 'directory' ? fs.ensureDir(pathname) : fs.outputFile(pathname, '')
}

export const paste = async ({ src, dest, type }: { src: string; dest: string; type: string }): Promise<void> => {
  return type === 'cut' ? fs.move(src, dest) : fs.copy(src, dest)
}

export const rename = async (src: string, dest: string): Promise<void> => {
  return fs.move(src, dest)
}

export const getHash = (content: string, encoding: crypto.Encoding, type: string): string => {
  return crypto.createHash(type).update(content, encoding).digest('hex')
}

export const getContentHash = (content: string): string => {
  return getHash(content, 'utf8', 'sha1')
}

export const moveToRelativeFolder = async (
  cwd: string,
  relativeName: string,
  filePath: string,
  imagePath: string,
): Promise<string> => {
  if (!relativeName) {
    relativeName = 'assets'
  } else if (path.isAbsolute(relativeName)) {
    throw new Error('Invalid relative directory name.')
  }

  const absPath = path.resolve(cwd, relativeName)
  const dstPath = path.resolve(absPath, path.basename(imagePath))
  await fs.ensureDir(absPath)
  await fs.move(imagePath, dstPath, { overwrite: true })

  const dstRelPath = path.relative(path.dirname(filePath), dstPath)

  if (isWindows) {
    return dstRelPath.replace(/\\/g, '/')
  }
  return dstRelPath
}

export const moveImageToFolder = async (
  pathname: string,
  image: string | File,
  outputDir: string,
): Promise<string> => {
  await fs.ensureDir(outputDir)
  const isPath = typeof image === 'string'
  if (isPath) {
    const dirname = path.dirname(pathname)
    const imagePath = path.resolve(dirname, image)
    const isImage = isImageFile(imagePath)
    if (isImage) {
      const filename = path.basename(imagePath)
      const extname = path.extname(imagePath)
      const noHashPath = path.join(outputDir, filename)
      if (noHashPath === imagePath) {
        return imagePath
      }
      const hash = getContentHash(imagePath)
      const hashFilePath = path.join(outputDir, `${hash}${extname}`)
      await fs.copy(imagePath, hashFilePath)
      return hashFilePath
    } else {
      return Promise.resolve(image)
    }
  } else {
    const imagePath = path.join(outputDir, `${dayjs().format('YYYY-MM-DD-HH-mm-ss')}-${image.name}`)
    const binaryString = await new Promise<string>((resolve, _reject) => {
      const fileReader = new FileReader()
      fileReader.onload = () => {
        resolve(fileReader.result as string)
      }
      fileReader.readAsBinaryString(image)
    })
    await fs.writeFile(imagePath, binaryString, 'binary')
    return imagePath
  }
}

interface ImageBedGithub {
  owner: string
  repo: string
  branch: string
}

interface ImageBed {
  github: ImageBedGithub
}

interface UploadPreferences {
  currentUploader: string
  imageBed: ImageBed
  githubToken: string
  cliScript: string
}

export const uploadImage = async (
  pathname: string,
  image: string | File,
  preferences: UploadPreferences,
): Promise<string> => {
  const { currentUploader, imageBed, githubToken: auth, cliScript } = preferences
  const { owner, repo, branch } = imageBed.github
  const isPath = typeof image === 'string'
  const MAX_SIZE = 5 * 1024 * 1024
  let re: (value: string) => void
  let rj: (reason: string | Error) => void
  const promise = new Promise<string>((resolve, reject) => {
    re = resolve
    rj = reject
  })

  if (currentUploader === 'none') {
    rj!('No image uploader provided.')
  }

  const uploadByGithub = (content: string, filename: string) => {
    const octokit = new Octokit({
      auth,
    })
    const ghPath = `${dayjs().format('YYYY/MM')}/${dayjs().format('DD-HH-mm-ss')}-${filename}`
    const message = `Upload by MarkText at ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`
    const payload: Record<string, string> = {
      owner,
      repo,
      path: ghPath,
      branch,
      message,
      content,
    }
    if (!branch) {
      delete payload.branch
    }
    octokit.repos
      .createOrUpdateFileContents(payload as Parameters<typeof octokit.repos.createOrUpdateFileContents>[0])
      .then((result) => {
        re!(result.data.content!.download_url!)
      })
      .catch((_) => {
        rj!('Upload failed, the image will be copied to the image folder')
      })
  }

  const uploadByCommand = async (uploader: string, filepath: string | ArrayBuffer) => {
    let isPathArg = true
    let resolvedPath: string
    if (typeof filepath !== 'string') {
      isPathArg = false
      const data = new Uint8Array(filepath)
      resolvedPath = path.join(tmpdir(), String(Date.now()))
      await fs.writeFile(resolvedPath, data)
    } else {
      resolvedPath = filepath
    }
    if (uploader === 'picgo') {
      cp.exec(`picgo u "${resolvedPath}"`, async (err, data) => {
        if (!isPathArg) {
          await fs.unlink(resolvedPath)
        }
        if (err) {
          return rj!(err)
        }
        const parts = data.split('[PicGo SUCCESS]:')
        if (parts.length === 2) {
          re!(parts[1].trim())
        } else {
          rj!('PicGo upload error')
        }
      })
    } else {
      cp.execFile(cliScript, [resolvedPath], async (err, data) => {
        if (!isPathArg) {
          await fs.unlink(resolvedPath)
        }
        if (err) {
          return rj!(err)
        }
        re!(data.trim())
      })
    }
  }

  const notification = () => {
    rj!('Cannot upload more than 5M image, the image will be copied to the image folder')
  }

  if (isPath) {
    const dirname = path.dirname(pathname)
    const imagePath = path.resolve(dirname, image)
    const isImage = isImageFile(imagePath)
    if (isImage) {
      const { size } = await fs.stat(imagePath)
      if (size > MAX_SIZE) {
        notification()
      } else {
        switch (currentUploader) {
          case 'cliScript':
          case 'picgo':
            uploadByCommand(currentUploader, imagePath)
            break
          case 'github': {
            const imageFile = await fs.readFile(imagePath)
            const base64 = Buffer.from(imageFile).toString('base64')
            uploadByGithub(base64, path.basename(imagePath))
            break
          }
        }
      }
    } else {
      re!(image)
    }
  } else {
    const { size } = image
    if (size > MAX_SIZE) {
      notification()
    } else {
      const reader = new FileReader()
      reader.onload = async () => {
        switch (currentUploader) {
          case 'picgo':
          case 'cliScript':
            uploadByCommand(currentUploader, reader.result as ArrayBuffer)
            break
          default:
            uploadByGithub(reader.result as string, image.name)
        }
      }

      const readerFunction: 'readAsArrayBuffer' | 'readAsDataURL' =
        currentUploader !== 'github' ? 'readAsArrayBuffer' : 'readAsDataURL'
      reader[readerFunction](image)
    }
  }
  return promise
}

export const isFileExecutableSync = (filepath: string): boolean => {
  try {
    const stat = statSync(filepath)
    return stat.isFile() && (stat.mode & (constants.S_IXUSR | constants.S_IXGRP | constants.S_IXOTH)) !== 0
  } catch (_err) {
    return false
  }
}
