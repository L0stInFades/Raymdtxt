/**
 * TextRenderer
 * returns only the textual part of the token
 */

function TextRenderer() {}

// no need for block level renderers

TextRenderer.prototype.strong =
  TextRenderer.prototype.em =
  TextRenderer.prototype.codespan =
  TextRenderer.prototype.del =
  TextRenderer.prototype.text =
    (text) => text

TextRenderer.prototype.html = (html) => html

TextRenderer.prototype.inlineMath = (math, _displayMode) => math

TextRenderer.prototype.emoji = (_text, emoji) => emoji

TextRenderer.prototype.script = (content, marker) => {
  const tagName = marker === '^' ? 'sup' : 'sub'
  return `<${tagName}>${content}</${tagName}>`
}

TextRenderer.prototype.footnoteIdentifier = (identifier, { footnoteId, footnoteIdentifierId, order }) =>
  `<a href="#${footnoteId ? `fn${footnoteId}` : ''}" class="footnote-ref" id="fnref${footnoteIdentifierId}" role="doc-noteref"><sup>${order || identifier}</sup></a>`

TextRenderer.prototype.link = TextRenderer.prototype.image = (_href, _title, text) => `${text}`

TextRenderer.prototype.br = () => ''

export default TextRenderer
