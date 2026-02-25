import { CLASS_OR_ID } from '../../../config'
import type { Block, Token } from '../../types'
import type { Cursor, StateRenderContext } from '../renderContext'

export default function backlash(this: StateRenderContext, h: typeof import('snabbdom').h, cursor: Cursor, block: Block, token: Token, outerClass: string) {
  const className = this.getClassName(outerClass, block, token, cursor)
  const { start, end } = token.range
  const content = this.highlight(h, block, start, end, token)

  return [h(`span.${className}.${CLASS_OR_ID.AG_REMOVE}`, content)]
}
