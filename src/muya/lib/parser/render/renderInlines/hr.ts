import { CLASS_OR_ID } from '../../../config'
import type { Block, Token } from '../../types'
import type { Cursor, StateRenderContext } from '../renderContext'

export default function hr(this: StateRenderContext, h: typeof import('snabbdom').h, _cursor: Cursor, block: Block, token: Token, _outerClass: string) {
  const { start, end } = token.range
  const content = this.highlight(h, block, start, end, token)
  return [h(`span.${CLASS_OR_ID.AG_GRAY}.${CLASS_OR_ID.AG_REMOVE}`, content)]
}
