import { CLASS_OR_ID } from '../../../config'
import type { Block, Token } from '../../types'

// biome-ignore lint/suspicious/noExplicitAny: mixin method — `this` is StateRender
export default function codeFense(this: any, h: typeof import('snabbdom').h, _cursor: unknown, block: Block, token: Token, _outerClass: string) {
  const { start, end } = token.range
  const { marker } = token

  const markerContent = this.highlight(h, block, start, start + marker.length, token)
  const content = this.highlight(h, block, start + marker.length, end, token)

  return [
    h(`span.${CLASS_OR_ID.AG_GRAY}`, markerContent),
    h(
      `span.${CLASS_OR_ID.AG_LANGUAGE}`,
      {
        attrs: {
          spellcheck: 'false',
        },
      },
      content,
    ),
  ]
}
