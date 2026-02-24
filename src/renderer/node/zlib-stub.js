/**
 * Browser stub for Node.js 'zlib' module.
 * Used in renderer process where nodeIntegration is disabled.
 * Note: deflateSync is used by plantuml.js for encoding diagram data.
 */
const identity = (data) => (typeof Buffer !== 'undefined' ? Buffer.from(data) : data)
const asyncIdentity = (data, opts, cb) => {
  const done = typeof opts === 'function' ? opts : cb
  if (done) done(null, identity(data))
  return Promise.resolve(identity(data))
}

export const deflateSync = identity
export const inflateSync = identity
export const gzipSync = identity
export const gunzipSync = identity
export const brotliCompressSync = identity
export const brotliDecompressSync = identity
export const deflate = asyncIdentity
export const inflate = asyncIdentity
export const gzip = asyncIdentity
export const gunzip = asyncIdentity
export const createDeflate = () => ({ on: () => {}, write: () => {}, end: () => {} })
export const createGzip = () => ({ on: () => {}, write: () => {}, end: () => {} })
export const constants = { Z_DEFAULT_COMPRESSION: -1, Z_BEST_COMPRESSION: 9, Z_BEST_SPEED: 1 }

const zlibStub = {
  deflateSync,
  inflateSync,
  gzipSync,
  gunzipSync,
  brotliCompressSync,
  brotliDecompressSync,
  deflate,
  inflate,
  gzip,
  gunzip,
  createDeflate,
  createGzip,
  constants,
}
export default zlibStub
