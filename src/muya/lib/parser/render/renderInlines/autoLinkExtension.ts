import { CLASS_OR_ID } from '../../../config'
import { sanitizeHyperlink } from '../../../utils/url'
import type { Block, Token } from '../../types'

// render auto_link to vdom
// biome-ignore lint/suspicious/noExplicitAny: mixin method — `this` is StateRender
export default function autoLinkExtension(this: any, h: typeof import('snabbdom').h, _cursor: unknown, block: Block, token: Token, _outerClass: string) {
  const { linkType, www, url, email } = token
  const { start, end } = token.range

  const content = this.highlight(h, block, start, end, token)
  const hyperlink =
    linkType === 'www' ? encodeURI(`http://${www}`) : linkType === 'url' ? encodeURI(url) : `mailto:${email}`

  return [
    h(
      `a.${CLASS_OR_ID.AG_INLINE_RULE}.${CLASS_OR_ID.AG_AUTO_LINK_EXTENSION}`,
      {
        attrs: {
          spellcheck: 'false',
        },
        props: {
          href: sanitizeHyperlink(hyperlink),
          target: '_blank',
        },
      },
      content,
    ),
  ]
}
