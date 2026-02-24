import { CLASS_OR_ID } from '../../../config'
import { htmlToVNode } from '../snabbdom'
import type { Block, Token } from '../../types'

// biome-ignore lint/suspicious/noExplicitAny: mixin method — `this` is StateRender
export default function htmlRuby(this: any, h: typeof import('snabbdom').h, cursor: unknown, block: Block, token: Token, outerClass: string) {
  const className = this.getClassName(outerClass, block, token, cursor)
  const { children } = token
  const { start, end } = token.range
  const content = this.highlight(h, block, start, end, token)
  const vNode = htmlToVNode(token.raw)

  const previewSelector = `span.${CLASS_OR_ID.AG_RUBY_RENDER}`

  return children
    ? [
        h(`span.${className}.${CLASS_OR_ID.AG_RUBY}`, [
          h(`span.${CLASS_OR_ID.AG_INLINE_RULE}.${CLASS_OR_ID.AG_RUBY_TEXT}`, content),
          h(
            previewSelector,
            {
              attrs: {
                contenteditable: 'false',
                spellcheck: 'false',
              },
            },
            vNode,
          ),
        ]),
        // if children is empty string, no need to render ruby charactors...
      ]
    : [
        h(`span.${className}.${CLASS_OR_ID.AG_RUBY}`, [
          h(`span.${CLASS_OR_ID.AG_INLINE_RULE}.${CLASS_OR_ID.AG_RUBY_TEXT}`, content),
        ]),
      ]
}
