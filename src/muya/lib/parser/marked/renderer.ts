import defaultOptions from './options'
import { cleanUrl, escape } from './utils'

interface RendererOptions {
  baseUrl?: string | null
  breaks?: boolean
  gfm?: boolean
  headerIds?: boolean
  headerPrefix?: string
  highlight?: ((code: string, lang: string) => string) | null
  mathRenderer?: ((text: string, displayMode: boolean) => string) | null
  emojiRenderer?: ((emoji: string) => string) | null
  tocRenderer?: (() => string) | null
  langPrefix?: string
  mangle?: boolean
  pedantic?: boolean
  renderer?: unknown
  silent?: boolean
  smartLists?: boolean
  smartypants?: boolean
  xhtml?: boolean
  disableInline?: boolean
  sanitize?: boolean
  sanitizer?: ((html: string) => string) | null
  emoji?: boolean
  math?: boolean
  frontMatter?: boolean
  superSubScript?: boolean
  footnote?: boolean
  isGitlabCompatibilityEnabled?: boolean
  isHtmlEnabled?: boolean
}

interface FootnoteInfo {
  footnoteId?: string | number
  footnoteIdentifierId?: string | number
  order?: number
}

interface TableCellFlags {
  header: boolean
  align: string | null
}

/**
 * Renderer
 */

function Renderer(this: { options: RendererOptions }, options: RendererOptions = {}) {
  this.options = options || defaultOptions
}

Renderer.prototype.frontmatter = (text: string) => `<pre class="front-matter">\n${text}</pre>\n`

Renderer.prototype.multiplemath = function (this: { options: RendererOptions }, text: string) {
  let output = ''
  if (this.options.mathRenderer) {
    const displayMode = true
    output = this.options.mathRenderer(text, displayMode)
  }
  return output || `<pre class="multiple-math">\n${text}</pre>\n`
}

Renderer.prototype.inlineMath = function (this: { options: RendererOptions }, math: string) {
  let output = ''
  if (this.options.mathRenderer) {
    const displayMode = false
    output = this.options.mathRenderer(math, displayMode)
  }
  return output || math
}

Renderer.prototype.emoji = function (this: { options: RendererOptions }, text: string, emoji: string) {
  if (this.options.emojiRenderer) {
    return this.options.emojiRenderer(emoji)
  } else {
    return text
  }
}

Renderer.prototype.script = (content: string, marker: string) => {
  const tagName = marker === '^' ? 'sup' : 'sub'
  return `<${tagName}>${content}</${tagName}>`
}

Renderer.prototype.footnoteIdentifier = (identifier: string, {
  footnoteId,
  footnoteIdentifierId,
  order
}: FootnoteInfo) =>
  `<a href="#${footnoteId ? `fn${footnoteId}` : ''}" class="footnote-ref" id="fnref${footnoteIdentifierId}" role="doc-noteref"><sup>${order || identifier}</sup></a>`

Renderer.prototype.footnote = (footnote: string) => `<section class="footnotes" role="doc-endnotes">\n<hr />\n<ol>\n${footnote}</ol>\n</section>\n`

Renderer.prototype.footnoteItem = (content: string, {
  footnoteId,
  footnoteIdentifierId
}: FootnoteInfo) =>
  `<li id="fn${footnoteId}" role="doc-endnote">${content}<a href="#${footnoteIdentifierId ? `fnref${footnoteIdentifierId}` : ''}" class="footnote-back" role="doc-backlink">↩︎</a></li>`

Renderer.prototype.code = function (this: { options: RendererOptions }, code: string, infostring: string, escaped: boolean, codeBlockStyle: string) {
  const lang = (infostring || '').match(/\S*/)?.[0] ?? ''
  if (this.options.highlight) {
    const out = this.options.highlight(code, lang)
    if (out !== null && out !== code) {
      escaped = true
      code = out
    }
  }

  let className = codeBlockStyle === 'fenced' ? 'fenced-code-block' : 'indented-code-block'
  className = lang ? `${className} ${this.options.langPrefix}${escape(lang, true)}` : className

  return `<pre><code class="${className}">${escaped ? code : escape(code, true)}</code></pre>\n`
}

Renderer.prototype.blockquote = (quote: string) => `<blockquote>\n${quote}</blockquote>\n`

Renderer.prototype.html = (html: string) => html

Renderer.prototype.heading = function (this: { options: RendererOptions }, text: string, level: number, raw: string, slugger: { slug: (raw: string) => string }, headingStyle: string) {
  if (this.options.headerIds) {
    return (
      '<h' +
      level +
      ' id="' +
      this.options.headerPrefix +
      slugger.slug(raw) +
      '" class="' +
      headingStyle +
      '">' +
      text +
      '</h' +
      level +
      '>\n'
    )
  }
  // ignore IDs
  return `<h${level}>${text}</h${level}>\n`
}

Renderer.prototype.hr = function (this: { options: RendererOptions }) {
  return this.options.xhtml ? '<hr/>\n' : '<hr>\n'
}

Renderer.prototype.list = (body: string, ordered: boolean, start: number, _taskList: boolean) => {
  const type = ordered ? 'ol' : 'ul'
  const startatt = ordered && start !== 1 ? ` start="${start}"` : ''
  return `<${type}${startatt}>\n${body}</${type}>\n`
}

Renderer.prototype.listitem = function (this: { options: RendererOptions }, text: string, checked: boolean | undefined) {
  // normal list
  if (checked === undefined) {
    return `<li>${text}</li>\n`
  }

  // task list
  return (
    '<li class="task-list-item"><input type="checkbox"' +
    (checked ? ' checked=""' : '') +
    ' disabled=""' +
    (this.options.xhtml ? ' /' : '') +
    '> ' +
    text +
    '</li>\n'
  )
}

Renderer.prototype.paragraph = (text: string) => `<p>${text}</p>\n`

Renderer.prototype.table = (header: string, body: string) => {
  if (body) body = `<tbody>${body}</tbody>`

  return `<table>\n<thead>\n${header}</thead>\n${body}</table>\n`
}

Renderer.prototype.tablerow = (content: string) => `<tr>\n${content}</tr>\n`

Renderer.prototype.tablecell = (content: string, flags: TableCellFlags) => {
  const type = flags.header ? 'th' : 'td'
  const tag = flags.align ? `<${type} align="${flags.align}">` : `<${type}>`
  return `${tag + content}</${type}>\n`
}

// span level renderer
Renderer.prototype.strong = (text: string) => `<strong>${text}</strong>`

Renderer.prototype.em = (text: string) => `<em>${text}</em>`

Renderer.prototype.codespan = (text: string) => `<code>${text}</code>`

Renderer.prototype.br = function (this: { options: RendererOptions }) {
  return this.options.xhtml ? '<br/>' : '<br>'
}

Renderer.prototype.del = (text: string) => `<del>${text}</del>`

Renderer.prototype.link = function (this: { options: RendererOptions }, href: string, title: string | null, text: string) {
  const cleanedHref = cleanUrl(this.options.sanitize ?? false, this.options.baseUrl ?? null, href)
  if (cleanedHref === null) {
    return text
  }
  let out = `<a href="${escape(cleanedHref)}"`
  if (title) {
    out += ` title="${title}"`
  }
  out += `>${text}</a>`
  return out
}

Renderer.prototype.image = function (this: { options: RendererOptions }, href: string, title: string | null, text: string) {
  if (!href) {
    return text
  }

  // Fix ASCII and UNC paths on Windows (#1997).
  if (/^(?:[a-zA-Z]:\\|[a-zA-Z]:\/).+/.test(href)) {
    href = `file:///${href.replace(/\\/g, '/')}`
  } else if (/^\\\?\\.+/.test(href)) {
    // NOTE: Only check for "\?\" instead of "\\?\" because URL escaping removes the first "\".
    href = `file:///${href.substring(3).replace(/\\/g, '/')}`
  } else if (/^\/.+/.test(href)) {
    // Be consistent but it's not needed.
    href = `file://${href}`
  }

  const cleanedHref = cleanUrl(this.options.sanitize ?? false, this.options.baseUrl ?? null, href)
  if (cleanedHref === null) {
    return text
  }

  let out = `<img src="${cleanedHref}" alt="${text.replace(/\*/g, '')}"`
  if (title) {
    out += ` title="${title}"`
  }
  out += this.options.xhtml ? '/>' : '>'
  return out
}

Renderer.prototype.text = (text: string) => text

Renderer.prototype.toc = function (this: { options: RendererOptions }) {
  if (this.options.tocRenderer) {
    return this.options.tocRenderer()
  }
  return ''
}

export default Renderer
