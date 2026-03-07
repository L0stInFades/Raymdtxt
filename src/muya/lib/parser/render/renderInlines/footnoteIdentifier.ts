import { CLASS_OR_ID } from '../../../config'
import type { Block, Token } from '../../types'
import type { Cursor, StateRenderContext } from '../renderContext'

export default function footnoteIdentifier(
  this: StateRenderContext,
  h: typeof import('snabbdom').h,
  cursor: Cursor,
  block: Block,
  token: Token,
  outerClass: string,
) {
  const className = this.getClassName(outerClass, block, token, cursor)
  const { marker } = token
  const { start, end } = token.range

  const startMarker = this.highlight(h, block, start, start + marker.length, token)
  const endMarker = this.highlight(h, block, end - 1, end, token)
  const content = this.highlight(h, block, start + marker.length, end - 1, token)

  return [
    h(`sup#noteref-${token.content}.${CLASS_OR_ID.AG_INLINE_FOOTNOTE_IDENTIFIER}.${CLASS_OR_ID.AG_INLINE_RULE}`, [
      h(`span.${className}.${CLASS_OR_ID.AG_REMOVE}`, startMarker),
      h(
        'a',
        {
          attrs: {
            spellcheck: 'false',
          },
        },
        content,
      ),
      h(`span.${className}.${CLASS_OR_ID.AG_REMOVE}`, endMarker),
    ]),
  ]
}
