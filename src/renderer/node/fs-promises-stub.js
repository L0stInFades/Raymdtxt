/**
 * Browser stub for Node.js 'fs/promises' module.
 * Used in renderer process where nodeIntegration is disabled.
 */
const noopAsync = () => Promise.resolve()
const fakeStat = () =>
  Promise.resolve({ isFile: () => false, isDirectory: () => false, isSymbolicLink: () => false, mode: 0, size: 0 })

export const access = noopAsync
export const stat = fakeStat
export const lstat = fakeStat
export const readFile = () => Promise.resolve('')
export const writeFile = noopAsync
export const mkdir = noopAsync
export const readdir = () => Promise.resolve([])
export const unlink = noopAsync
export const rename = noopAsync
export const copyFile = noopAsync
export const chmod = noopAsync
export const readlink = () => Promise.resolve('')
export const rm = noopAsync
export const rmdir = noopAsync

const fsPromisesStub = {
  access,
  stat,
  lstat,
  readFile,
  writeFile,
  mkdir,
  readdir,
  unlink,
  rename,
  copyFile,
  chmod,
  readlink,
  rm,
  rmdir,
}
export default fsPromisesStub
