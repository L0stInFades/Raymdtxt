import type { StateRenderContext } from '../renderContext'
import { union, isEven } from '../../../utils'
import { CLASS_OR_ID } from '../../../config'
import type { Token } from '../../types'
// TODO HIGHLIGHT
export default function backlashInToken(
  this: StateRenderContext,
  h: typeof import('snabbdom').h,
  backlashes: string,
  outerClass: string,
  start: number,
  token: Token,
) {
  const { highlights = [] } = token as { highlights?: { start: number; end: number; active: boolean }[] }
  const chunks = backlashes.split('')
  const len = chunks.length
  const result = []
  let i: number

  for (i = 0; i < len; i++) {
    const chunk = chunks[i]
    const light = highlights.filter((light: { start: number; end: number; active: boolean }) =>
      union({ start: start + i, end: start + i + 1 }, light),
    )
    let selector = 'span'
    if (light.length) {
      const className = this.getHighlightClassName(light[0].active)
      selector += `.${className}`
    }
    if (isEven(i)) {
      result.push(h(`${selector}.${outerClass}`, chunk))
    } else {
      result.push(h(`${selector}.${CLASS_OR_ID.AG_BACKLASH}`, chunk))
    }
  }

  return result
}
