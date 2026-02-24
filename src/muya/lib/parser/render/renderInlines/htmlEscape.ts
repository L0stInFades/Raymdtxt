import { CLASS_OR_ID } from '../../../config'
import escapeCharactersMap from '../../escapeCharacter'
import type { Block, Token } from '../../types'

// biome-ignore lint/suspicious/noExplicitAny: mixin method — `this` is StateRender
export default function htmlEscape(this: any, h: typeof import('snabbdom').h, cursor: unknown, block: Block, token: Token, outerClass: string) {
  const className = this.getClassName(outerClass, block, token, cursor)
  const { escapeCharacter } = token
  const { start, end } = token.range

  const content = this.highlight(h, block, start, end, token)

  return [
    h(
      `span.${className}.${CLASS_OR_ID.AG_HTML_ESCAPE}`,
      {
        dataset: {
          character: (escapeCharactersMap as Record<string, string>)[escapeCharacter as string],
        },
      },
      content,
    ),
  ]
}
