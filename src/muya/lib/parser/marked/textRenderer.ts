/**
 * TextRenderer
 * returns only the textual part of the token
 */

interface FootnoteInfo {
  footnoteId?: string | number
  footnoteIdentifierId?: string | number
  order?: number
}

function TextRenderer() {}

// no need for block level renderers

TextRenderer.prototype.strong =
  TextRenderer.prototype.em =
  TextRenderer.prototype.codespan =
  TextRenderer.prototype.del =
  TextRenderer.prototype.text =
    (text: string) => text

TextRenderer.prototype.html = (html: string) => html

TextRenderer.prototype.inlineMath = (math: string, _displayMode: boolean) => math

TextRenderer.prototype.emoji = (_text: string, emoji: string) => emoji

TextRenderer.prototype.script = (content: string, marker: string) => {
  const tagName = marker === '^' ? 'sup' : 'sub'
  return `<${tagName}>${content}</${tagName}>`
}

TextRenderer.prototype.footnoteIdentifier = (identifier: string, {
  footnoteId,
  footnoteIdentifierId,
  order
}: FootnoteInfo) =>
  `<a href="#${footnoteId ? `fn${footnoteId}` : ''}" class="footnote-ref" id="fnref${footnoteIdentifierId}" role="doc-noteref"><sup>${order || identifier}</sup></a>`

TextRenderer.prototype.link = TextRenderer.prototype.image = (_href: string, _title: string | null, text: string) => `${text}`

TextRenderer.prototype.br = () => ''

export default TextRenderer
