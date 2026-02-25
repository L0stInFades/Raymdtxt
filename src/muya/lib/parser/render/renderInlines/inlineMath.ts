// @ts-expect-error TS(7016): Could not find a declaration file for module 'kate... Remove this comment to see the full error message
import katex from 'katex'
import 'katex/dist/contrib/mhchem.min.js'
import { CLASS_OR_ID } from '../../../config'
import { htmlToVNode } from '../snabbdom'
import type { Block, Token } from '../../types'
import type { Cursor, StateRenderContext } from '../renderContext'

import 'katex/dist/katex.min.css'

export default function displayMath(this: StateRenderContext, h: typeof import('snabbdom').h, cursor: Cursor, block: Block, token: Token, outerClass: string) {
  const className = this.getClassName(outerClass, block, token, cursor)
  const mathSelector =
    className === CLASS_OR_ID.AG_HIDE ? `span.${className}.${CLASS_OR_ID.AG_MATH}` : `span.${CLASS_OR_ID.AG_MATH}`

  const { start, end } = token.range
  const { marker } = token

  const startMarker = this.highlight(h, block, start, start + marker.length, token)
  const endMarker = this.highlight(h, block, end - marker.length, end, token)
  const content = this.highlight(h, block, start + marker.length, end - marker.length, token)

  const { content: math, type } = token

  const { loadMathMap } = this

  const displayMode = false
  const key = `${math}_${type}`
  let mathVnode: import('snabbdom').VNodeChildren = null
  let previewSelector = `span.${CLASS_OR_ID.AG_MATH_RENDER}`
  if (loadMathMap.has(key)) {
    mathVnode = loadMathMap.get(key) as import('snabbdom').VNodeChildren
  } else {
    try {
      const html = katex.renderToString(math, {
        displayMode,
      })
      mathVnode = htmlToVNode(html)
      loadMathMap.set(key, mathVnode)
    } catch (_err) {
      mathVnode = '< Invalid Mathematical Formula >'
      previewSelector += `.${CLASS_OR_ID.AG_MATH_ERROR}`
    }
  }

  return [
    h(`span.${className}.${CLASS_OR_ID.AG_MATH_MARKER}`, startMarker),
    h(mathSelector, [
      h(
        `span.${CLASS_OR_ID.AG_INLINE_RULE}.${CLASS_OR_ID.AG_MATH_TEXT}`,
        {
          attrs: { spellcheck: 'false' },
        },
        content,
      ),
      h(
        previewSelector,
        {
          attrs: { contenteditable: 'false' },
        },
        mathVnode,
      ),
    ]),
    h(`span.${className}.${CLASS_OR_ID.AG_MATH_MARKER}`, endMarker),
  ]
}
