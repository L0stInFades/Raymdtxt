/**
 * Browser stub for 'fs-extra' package.
 * Used in renderer process where nodeIntegration is disabled.
 */
const noopAsync = () => Promise.resolve()
const noop = () => {}

export const ensureDir = noopAsync
export const ensureDirSync = noop
export const outputFile = noopAsync
export const move = noopAsync
export const copy = noopAsync
export const writeFile = noopAsync
export const readFile = () => Promise.resolve(Buffer.from ? Buffer.from('') : '')
export const unlink = noopAsync
export const stat = () =>
  Promise.resolve({ size: 0, isFile: () => false, isDirectory: () => false, isSymbolicLink: () => false, mode: 0 })
export const lstat = () =>
  Promise.resolve({ size: 0, isFile: () => false, isDirectory: () => false, isSymbolicLink: () => false, mode: 0 })
export const existsSync = () => false
export const lstatSync = () => ({ isFile: () => false, isDirectory: () => false, isSymbolicLink: () => false, mode: 0 })
export const readlinkSync = () => ''
export const outputJson = noopAsync
export const readJson = () => Promise.resolve({})
export const writeJson = noopAsync
export const remove = noopAsync
export const emptyDir = noopAsync
export const mkdirs = noopAsync
export const mkdirsSync = noop

const fsExtra = {
  ensureDir,
  ensureDirSync,
  outputFile,
  move,
  copy,
  writeFile,
  readFile,
  unlink,
  stat,
  lstat,
  existsSync,
  lstatSync,
  readlinkSync,
  outputJson,
  readJson,
  writeJson,
  remove,
  emptyDir,
  mkdirs,
  mkdirsSync,
}
export default fsExtra
