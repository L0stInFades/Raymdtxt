import type { h as hFn } from 'snabbdom'
import type { Block, Token } from '../../types'

// render token of text type to vdom.
// biome-ignore lint/suspicious/noExplicitAny: mixin method — `this` is StateRender
export default function text(this: any, h: typeof hFn, _cursor: unknown, block: Block, token: Token) {
  const { start, end } = token.range
  return [h('span.ag-plain-text', this.highlight(h, block, start, end, token))]
}
