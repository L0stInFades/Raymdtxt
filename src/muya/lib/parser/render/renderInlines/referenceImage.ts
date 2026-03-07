import type { StateRenderContext, Cursor } from '../renderContext'
import { CLASS_OR_ID } from '../../../config'
import { getImageInfo } from '../../../utils'
import type { Block, Token } from '../../types'

// reference_image
export default function referenceImage(
  this: StateRenderContext,
  h: typeof import('snabbdom').h,
  cursor: Cursor,
  block: Block,
  token: Token,
  outerClass: string,
) {
  const className = this.getClassName(outerClass, block, token, cursor)
  const imageClass = CLASS_OR_ID.AG_IMAGE_MARKED_TEXT
  const { start, end } = token.range
  const tag = this.highlight(h, block, start, end, token)
  const { label, backlash, alt } = token
  const rawSrc = label + backlash.second
  let href = ''
  let title = ''
  const labelResult = this.labels.get(rawSrc.toLowerCase())
  if (labelResult) {
    ;({ href, title } = labelResult)
  }
  const imageInfo = getImageInfo(href)
  const { src } = imageInfo
  // biome-ignore lint/suspicious/noImplicitAnyLet: legacy renderer pattern
  let id
  // biome-ignore lint/suspicious/noImplicitAnyLet: legacy renderer pattern
  let isSuccess
  // biome-ignore lint/suspicious/noImplicitAnyLet: legacy renderer pattern
  let domsrc
  // biome-ignore lint/suspicious/noImplicitAnyLet: legacy renderer pattern
  let selector
  if (src) {
    ;({ id, isSuccess, domsrc } = this.loadImageAsync(imageInfo, { alt }, className, CLASS_OR_ID.AG_COPY_REMOVE))
  }
  selector = id ? `span#${id}.${imageClass}` : `span.${imageClass}`
  selector += `.${CLASS_OR_ID.AG_OUTPUT_REMOVE}`
  if (isSuccess) {
    selector += `.${className}`
  } else {
    selector += `.${CLASS_OR_ID.AG_IMAGE_FAIL}`
  }

  return isSuccess
    ? [h(selector, tag), h(`img.${CLASS_OR_ID.AG_COPY_REMOVE}`, { props: { alt, src: domsrc, title } })]
    : [h(selector, tag)]
}
