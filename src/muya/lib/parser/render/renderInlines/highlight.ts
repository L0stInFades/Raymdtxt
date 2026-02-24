import { union } from '../../../utils'
import type { Block, Token } from '../../types'

// change text to highlight vdom
// biome-ignore lint/suspicious/noExplicitAny: mixin method — `this` is StateRender
export default function highlight(this: any, h: typeof import('snabbdom').h, block: Block, rStart: number, rEnd: number, token: Token) {
  const { text } = block
  const { highlights } = token
  let result = []
  const unions = []
  let pos = rStart

  if (highlights) {
    for (const light of highlights) {
      const un = union({ start: rStart, end: rEnd }, light)
      if (un) unions.push(un)
    }
  }

  if (unions.length) {
    for (const u of unions) {
      const { start, end, active } = u
      const className = this.getHighlightClassName(active)

      if (pos < start) {
        result.push(text.substring(pos, start))
      }

      result.push(h(`span.${className}`, text.substring(start, end)))
      pos = end
    }
    if (pos < rEnd) {
      result.push(block.text.substring(pos, rEnd))
    }
  } else {
    result = [text.substring(rStart, rEnd)]
  }

  return result
}
