/**
 * Browser stub for Node.js 'child_process' module.
 * Used in renderer process where nodeIntegration is disabled.
 */
const noop = () => {}
const fakeProcess = { stdout: { on: noop, pipe: noop }, stderr: { on: noop, pipe: noop }, on: noop, kill: noop }

export const spawn = () => fakeProcess
export const exec = (_cmd, opts, cb) => {
  const done = typeof opts === 'function' ? opts : cb
  if (done) done(new Error('child_process.exec not available in browser renderer'))
  return fakeProcess
}
export const execFile = (_file, args, opts, cb) => {
  const done = typeof opts === 'function' ? opts : typeof args === 'function' ? args : cb
  if (done) done(new Error('child_process.execFile not available in browser renderer'))
  return fakeProcess
}
export const fork = () => fakeProcess
export const execSync = () => (Buffer.from ? Buffer.from('') : '')
export const spawnSync = () => ({
  stdout: Buffer.from ? Buffer.from('') : '',
  stderr: Buffer.from ? Buffer.from('') : '',
  status: 0,
})

const cp = { spawn, exec, execFile, fork, execSync, spawnSync }
export default cp
