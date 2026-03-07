import type { StateRenderContext, Cursor } from '../renderContext'
import type { Block, Token } from '../../types'

export default function tailHeader(
  this: StateRenderContext,
  h: typeof import('snabbdom').h,
  cursor: Cursor,
  block: Block,
  token: Token,
  outerClass: string,
) {
  const className = this.getClassName(outerClass, block, token, cursor)
  const { start, end } = token.range
  const content = this.highlight(h, block, start, end, token)
  if (/^h\d$/.test(block.type)) {
    return [h(`span.${className}`, content)]
  } else {
    return content
  }
}
