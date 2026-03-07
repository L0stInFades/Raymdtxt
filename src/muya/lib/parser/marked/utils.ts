/**
 * Helpers
 */

let uniqueIdCounter = 0

export const getUniqueId = () => ++uniqueIdCounter

// biome-ignore lint/suspicious/noShadowRestrictedNames: intentional function naming
export const escape = function escape(html: string, encode?: boolean) {
  if (encode) {
    if (escape.escapeTest.test(html)) {
      return html.replace(
        escape.escapeReplace,
        (ch: string) => escape.replacements[ch as keyof typeof escape.replacements] ?? ch,
      )
    }
  } else {
    if (escape.escapeTestNoEncode.test(html)) {
      return html.replace(
        escape.escapeReplaceNoEncode,
        (ch: string) => escape.replacements[ch as keyof typeof escape.replacements] ?? ch,
      )
    }
  }

  return html
}

escape.escapeTest = /[&<>"']/
escape.escapeReplace = /[&<>"']/g
escape.replacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

escape.escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/
escape.escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g

// biome-ignore lint/suspicious/noShadowRestrictedNames: intentional function naming
export const unescape = function unescape(html: string) {
  // explicitly match decimal, hex, and named HTML entities
  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/gi, (_: string, n: string) => {
    n = n.toLowerCase()
    if (n === 'colon') return ':'
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1))
    }
    return ''
  })
}

export const edit = function edit(regex: RegExp | string, opt?: string) {
  let source = typeof regex === 'string' ? regex : regex.source
  const flags = opt || ''
  return {
    replace: function (name: string | RegExp, val: RegExp | string) {
      let valSource = typeof val === 'string' ? val : val.source
      valSource = valSource.replace(/(^|[^[])\^/g, '$1') // eslint-disable-line no-useless-escape
      source = source.replace(name, valSource)
      return this
    },
    getRegex: () => new RegExp(source, flags),
  }
}

export const cleanUrl = function cleanUrl(sanitize: boolean, base: string | null, href: string) {
  if (sanitize) {
    let prot = ''
    try {
      prot = decodeURIComponent(unescape(href))
        .replace(/[^\w:]/g, '')
        .toLowerCase()
    } catch (_e) {
      return null
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
      return null
    }
  }
  if (base && !originIndependentUrl.test(href)) {
    href = resolveUrl(base, href)
  }
  try {
    href = encodeURI(href).replace(/%25/g, '%')
  } catch (_e) {
    return null
  }
  return href
}

const resolveUrl = function resolveUrl(base: string, href: string) {
  if (!baseUrls[` ${base}`]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
    if (/^[^:]+:\/*[^/]*$/.test(base)) {
      baseUrls[` ${base}`] = `${base}/`
    } else {
      baseUrls[` ${base}`] = rtrim(base, '/', true)
    }
  }
  base = baseUrls[` ${base}`]
  const relativeBase = base.indexOf(':') === -1

  if (href.slice(0, 2) === '//') {
    if (relativeBase) {
      return href
    }
    return base.replace(/^([^:]+:)[\s\S]*$/, '$1') + href
  } else if (href.charAt(0) === '/') {
    if (relativeBase) {
      return href
    }
    return base.replace(/^([^:]+:\/*[^/]*)[\s\S]*$/, '$1') + href
  } else {
    return base + href
  }
}
const baseUrls: Record<string, string> = {}
const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i

export const noop = function noop() {}
noop.exec = noop

export const splitCells = function splitCells(tableRow: string, count?: number) {
  // ensure that every cell-delimiting pipe has a space
  // before it to distinguish it from an escaped pipe
  const row = tableRow.replace(/\|/g, (_match: string, offset: number, str: string) => {
    let escaped = false
    let curr = offset
    while (--curr >= 0 && str[curr] === '\\') escaped = !escaped
    if (escaped) {
      // odd number of slashes means | is escaped
      // so we leave it alone
      return '|'
    } else {
      // add space before unescaped |
      return ' |'
    }
  })
  const cells = row.split(/ \|/)
  let i = 0

  if (count !== undefined) {
    if (cells.length > count) {
      cells.splice(count)
    } else {
      while (cells.length < count) cells.push('')
    }
  }

  for (; i < cells.length; i++) {
    // leading or trailing whitespace is ignored per the gfm spec
    cells[i] = cells[i].trim().replace(/\\\|/g, '|')
  }
  return cells
}

// Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
// /c*$/ is vulnerable to REDOS.
// invert: Remove suffix of non-c chars instead. Default falsey.
export const rtrim = function rtrim(str: string, c: string, invert?: boolean) {
  if (str.length === 0) {
    return ''
  }

  // Length of suffix matching the invert condition.
  let suffLen = 0

  // Step left until we fail to match the invert condition.
  while (suffLen < str.length) {
    const currChar = str.charAt(str.length - suffLen - 1)
    if (currChar === c && !invert) {
      suffLen++
    } else if (currChar !== c && invert) {
      suffLen++
    } else {
      break
    }
  }

  return str.substr(0, str.length - suffLen)
}

export const findClosingBracket = function findClosingBracket(str: string, b: string) {
  if (str.indexOf(b[1]) === -1) {
    return -1
  }
  let level = 0
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '\\') {
      i++
    } else if (str[i] === b[0]) {
      level++
    } else if (str[i] === b[1]) {
      level--
      if (level < 0) {
        return i
      }
    }
  }
  return -1
}
