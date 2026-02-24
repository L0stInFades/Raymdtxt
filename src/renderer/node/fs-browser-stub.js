/**
 * Browser stub for Node.js 'fs' module.
 * Used in renderer process where nodeIntegration is disabled.
 * Real filesystem access goes through IPC (Phase 5+).
 */
const noop = () => {}
const noopAsync = () => Promise.resolve()
const fakeStat = () => ({
  isFile: () => false,
  isDirectory: () => false,
  isSymbolicLink: () => false,
  mode: 0,
  size: 0,
})

export const constants = {
  S_IXUSR: 0o100,
  S_IXGRP: 0o010,
  S_IXOTH: 0o001,
  O_RDONLY: 0,
  O_WRONLY: 1,
  O_RDWR: 2,
  O_CREAT: 512,
  O_EXCL: 2048,
  O_TRUNC: 1024,
  O_APPEND: 8,
  F_OK: 0,
  R_OK: 4,
  W_OK: 2,
  X_OK: 1,
}

export const statSync = fakeStat
export const lstatSync = fakeStat
export const readFileSync = () => ''
export const writeFileSync = noop
export const existsSync = () => false
export const readlinkSync = () => ''
export const mkdirSync = noop
export const readdirSync = () => []
export const unlinkSync = noop
export const renameSync = noop
export const copyFileSync = noop
export const accessSync = noop
export const chmodSync = noop
export const createReadStream = () => ({ on: noop, pipe: noop })
export const createWriteStream = () => ({ on: noop, write: noop, end: noop })
export const stat = (_p, cb) => (cb ? cb(null, fakeStat()) : noopAsync())
export const lstat = (_p, cb) => (cb ? cb(null, fakeStat()) : noopAsync())
export const readFile = (_p, opts, cb) => {
  const done = typeof opts === 'function' ? opts : cb
  if (done) done(null, '')
  return noopAsync()
}
export const writeFile = (_p, _data, opts, cb) => {
  const done = typeof opts === 'function' ? opts : cb
  if (done) done(null)
  return noopAsync()
}
export const mkdir = (_p, opts, cb) => {
  const done = typeof opts === 'function' ? opts : cb
  if (done) done(null)
  return noopAsync()
}
export const readdir = (_p, cb) => {
  if (cb) cb(null, [])
  return noopAsync()
}
export const unlink = (_p, cb) => {
  if (cb) cb(null)
  return noopAsync()
}
export const rename = (_o, _n, cb) => {
  if (cb) cb(null)
  return noopAsync()
}
export const copyFile = (_s, _d, cb) => {
  if (cb) cb(null)
  return noopAsync()
}
export const access = (_p, mode, cb) => {
  const done = typeof mode === 'function' ? mode : cb
  if (done) done(null)
  return noopAsync()
}
export const chmod = (_p, _m, cb) => {
  if (cb) cb(null)
  return noopAsync()
}
export const readlink = (_p, cb) => {
  if (cb) cb(null, '')
  return noopAsync()
}

const fsStub = {
  constants,
  statSync,
  lstatSync,
  readFileSync,
  writeFileSync,
  existsSync,
  readlinkSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  renameSync,
  copyFileSync,
  accessSync,
  chmodSync,
  createReadStream,
  createWriteStream,
  stat,
  lstat,
  readFile,
  writeFile,
  mkdir,
  readdir,
  unlink,
  rename,
  copyFile,
  access,
  chmod,
  readlink,
}
export default fsStub
