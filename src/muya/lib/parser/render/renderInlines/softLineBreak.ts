import { CLASS_OR_ID } from '../../../config'
import type { Block, Token } from '../../types'

export default function hardLineBreak(
  h: typeof import('snabbdom').h,
  _cursor: unknown,
  _block: Block,
  token: Token,
  _outerClass: string,
) {
  const { lineBreak, isAtEnd } = token
  let selector = `span.${CLASS_OR_ID.AG_SOFT_LINE_BREAK}`
  if (isAtEnd) {
    selector += `.${CLASS_OR_ID.AG_LINE_END}`
  }

  return [h(selector, lineBreak)]
}
