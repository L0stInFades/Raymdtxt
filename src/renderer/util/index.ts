interface CancellablePromise<T> extends Promise<T> {
  cancel: () => void
}

export const delay = (time: number): CancellablePromise<void> => {
  let timerId: ReturnType<typeof setTimeout> | null
  let rejectFn: (() => void) | null
  const p = new Promise<void>((resolve, reject) => {
    rejectFn = reject
    timerId = setTimeout(() => {
      ;(p as CancellablePromise<void>).cancel = () => {}
      rejectFn = null
      resolve()
    }, time)
  }) as CancellablePromise<void>

  p.cancel = () => {
    clearTimeout(timerId!)
    timerId = null
    rejectFn!()
    rejectFn = null
  }
  return p
}

const ID_PREFEX = 'mt-'
let id = 0

export const serialize = (params: Record<string, string>): string =>
  Object.keys(params)
    .map((key) => `${key}=${encodeURI(params[key])}`)
    .join('&')

export const merge = (...args: Record<string, unknown>[]): Record<string, unknown> => Object.assign({}, ...args)

export const dataURItoBlob = (dataURI: string): Blob => {
  const data = dataURI.split(';base64,')
  const byte = window.atob(data[1])
  const mime = data[0].split(':')[1]
  const ab = new ArrayBuffer(byte.length)
  const ia = new Uint8Array(ab)
  const len = byte.length
  let i: number
  for (i = 0; i < len; i++) {
    ia[i] = byte.charCodeAt(i)
  }
  return new window.Blob([ab], { type: mime })
}

interface Cursor {
  line: number
  ch: number
}

export const adjustCursor = (
  cursor: Cursor,
  preline: string | undefined,
  line: string,
  nextline: string | undefined,
): Cursor | null => {
  let newCursor: Cursor | null = Object.assign({}, { line: cursor.line, ch: cursor.ch })
  // It's need to adjust the cursor when cursor is at begin or end in table row.
  if (/\|[^|]+\|.+\|\s*$/.test(line)) {
    if (/\|\s*:?-+:?\s*\|[:-\s|]+\|\s*$/.test(line)) {
      // cursor in `| --- | :---: |` :the second line of table
      newCursor!.line += 1 // reset the cursor to the next line
      newCursor!.ch = nextline!.indexOf('|') + 1
    } else {
      // cursor is not at the second line to table
      if (cursor.ch <= line.indexOf('|')) newCursor!.ch = line.indexOf('|') + 1
      if (cursor.ch >= line.lastIndexOf('|')) newCursor!.ch = line.lastIndexOf('|') - 1
    }
  }

  // Need to adjust the cursor when cursor in the first or last line of code/math block.
  if (/```[\S]*/.test(line) || /^\$\$$/.test(line)) {
    if (typeof nextline === 'string' && /\S/.test(nextline)) {
      newCursor!.line += 1
      newCursor!.ch = 0
    } else if (typeof preline === 'string' && /\S/.test(preline)) {
      newCursor!.line -= 1
      newCursor!.ch = preline.length
    }
  }

  // Need to adjust the cursor when cursor at the begin of the list
  if (/[*+-]\s.+/.test(line) && newCursor!.ch <= 1) {
    newCursor!.ch = 2
  }

  // Need to adjust the cursor when cursor at blank line or in a line contains HTML tag.
  // set the newCursor to null, the new cursor will at the last line of document.
  if (!/\S/.test(line) || /<\/?([a-zA-Z\d-]+)(?=\s|>).*>/.test(line)) {
    newCursor = null
  }
  return newCursor
}

export const animatedScrollTo = (element: HTMLElement, to: number, duration: number, callback?: () => void): void => {
  const start = element.scrollTop
  const change = to - start
  const animationStart = Date.now()

  // Prevent animation on small steps or duration is 0
  if (Math.abs(change) <= 6 || duration === 0) {
    element.scrollTop = to
    return
  }

  const easeInOutQuad = (t: number, b: number, c: number, d: number): number => {
    t /= d / 2
    if (t < 1) return (c / 2) * t * t + b
    t--
    return (-c / 2) * (t * (t - 2) - 1) + b
  }

  const animateScroll = () => {
    const now = Date.now()
    const val = Math.floor(easeInOutQuad(now - animationStart, start, change, duration))

    element.scrollTop = val

    if (now > animationStart + duration) {
      element.scrollTop = to
      if (callback) {
        callback()
      }
    } else {
      requestAnimationFrame(animateScroll)
    }
  }

  requestAnimationFrame(animateScroll)
}

export const getScrollTopForElement = (container: HTMLElement, target: Element, offset = 0): number => {
  const containerRect = container.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const rawScrollTop = container.scrollTop + (targetRect.top - containerRect.top) - offset
  const maxScrollTop = Math.max(0, container.scrollHeight - container.clientHeight)

  return Math.max(0, Math.min(rawScrollTop, maxScrollTop))
}

export const getUniqueId = (): string => {
  return `${ID_PREFEX}${id++}`
}

export const hasKeys = (obj: Record<string, unknown>): boolean => Object.keys(obj).length > 0

export const cloneObj = <T>(obj: T, deepCopy = true): T => {
  return deepCopy ? JSON.parse(JSON.stringify(obj)) : Object.assign({}, obj)
}

export const cloneObject = <T extends Record<string, unknown>>(obj: T, inheritFromObject = true): T => {
  return Object.assign(inheritFromObject ? {} : Object.create(null), obj)
}

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// Use window.api.platform (injected by preload via contextBridge) — reliable source.
// Falls back to process.platform which Electron exposes in the sandboxed renderer.
const _platform = (typeof window !== 'undefined' && window.api?.platform) || process.platform || ''
export const isOsx: boolean = _platform === 'darwin'
export const isWindows: boolean = _platform === 'win32'
export const isLinux: boolean = _platform === 'linux'
