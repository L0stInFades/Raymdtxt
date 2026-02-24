import { CLASS_OR_ID } from '../../../config'

export default function hardLineBreak(h, _cursor, _block, token, _outerClass) {
  const { lineBreak, isAtEnd } = token
  let selector = `span.${CLASS_OR_ID.AG_SOFT_LINE_BREAK}`
  if (isAtEnd) {
    selector += `.${CLASS_OR_ID.AG_LINE_END}`
  }

  return [h(selector, lineBreak)]
}
