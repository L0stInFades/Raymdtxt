/**
 * Renderer-safe stub for electron-log.
 * In Phase 3, the renderer cannot use the real electron-log (Node.js fs dependency).
 * This stub forwards to the browser console. Phase 6+ will wire up proper IPC logging.
 */
const noop = () => {}

const log = {
  error: (...args) => console.error('[electron-log]', ...args),
  warn: (...args) => console.warn('[electron-log]', ...args),
  info: (...args) => console.info('[electron-log]', ...args),
  debug: (...args) => console.debug('[electron-log]', ...args),
  verbose: noop,
  silly: noop,
  log: (...args) => console.log('[electron-log]', ...args),
  transports: {
    console: { level: 'info' },
    file: {
      level: 'info',
      sync: false,
      resolvePath: noop,
    },
    mainConsole: null,
  },
}

export default log
