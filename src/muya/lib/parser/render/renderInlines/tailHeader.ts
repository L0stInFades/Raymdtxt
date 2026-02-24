import type { Block, Token } from '../../types'

// biome-ignore lint/suspicious/noExplicitAny: mixin method — `this` is StateRender
export default function tailHeader(this: any, h: typeof import('snabbdom').h, cursor: unknown, block: Block, token: Token, outerClass: string) {
  const className = this.getClassName(outerClass, block, token, cursor)
  const { start, end } = token.range
  const content = this.highlight(h, block, start, end, token)
  if (/^h\d$/.test(block.type)) {
    return [h(`span.${className}`, content)]
  } else {
    return content
  }
}
