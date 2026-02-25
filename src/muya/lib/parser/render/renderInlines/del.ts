import type { StateRenderContext } from '../renderContext'
import type { h as hFn } from 'snabbdom'
import type { Block, Token } from '../../types'

export default function del(this: StateRenderContext, h: typeof hFn, cursor: unknown, block: Block, token: Token, outerClass: string) {
  return this.delEmStrongFac('del', h, cursor, block, token, outerClass)
}
