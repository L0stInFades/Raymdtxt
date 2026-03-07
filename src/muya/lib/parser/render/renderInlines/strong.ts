import type { StateRenderContext } from '../renderContext'
import type { h as hFn } from 'snabbdom'
import type { Block, Token } from '../../types'

export default function strong(
  this: StateRenderContext,
  h: typeof hFn,
  cursor: unknown,
  block: Block,
  token: Token,
  outerClass: string,
) {
  return this.delEmStrongFac('strong', h, cursor, block, token, outerClass)
}
