import type { StateRenderContext, Cursor, InlineRenderMethod } from '../renderContext'
import { CLASS_OR_ID } from '../../../config'
import { snakeToCamel } from '../../../utils'
import type { Block, Token } from '../../types'

// render factory of `del`,`em`,`strong`
export default function delEmStrongFac(
  this: StateRenderContext,
  type: string,
  h: typeof import('snabbdom').h,
  cursor: Cursor,
  block: Block,
  token: Token,
  outerClass: string
) {
  const className = this.getClassName(outerClass, block, token, cursor)
  const COMMON_MARKER = `span.${className}.${CLASS_OR_ID.AG_REMOVE}`
  const { marker } = token
  const { start, end } = token.range
  const backlashStart = end - marker.length - token.backlash.length
  const content = [
    ...(token.children ?? []).reduce((acc: unknown[], to: Token) => {
      const chunk = this[snakeToCamel(to.type)] as InlineRenderMethod
      const result = chunk.call(this, h, cursor, block, to, className)
      return Array.isArray(result) ? [...acc, ...result] : [...acc, result]
    }, []),
    ...this.backlashInToken(h, token.backlash, className, backlashStart, token),
  ]
  const startMarker = this.highlight(h, block, start, start + marker.length, token)
  const endMarker = this.highlight(h, block, end - marker.length, end, token)

  return [
    h(COMMON_MARKER, startMarker),
    h(`${type}.${CLASS_OR_ID.AG_INLINE_RULE}`, content),
    h(COMMON_MARKER, endMarker),
  ]
}
