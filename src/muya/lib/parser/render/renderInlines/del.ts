import type { h as hFn } from 'snabbdom'
import type { Block, Token } from '../../types'

// biome-ignore lint/suspicious/noExplicitAny: mixin method — `this` is StateRender
export default function del(this: any, h: typeof hFn, cursor: unknown, block: Block, token: Token, outerClass: string) {
  return this.delEmStrongFac('del', h, cursor, block, token, outerClass)
}
