import marked from '../parser/marked'
import { EXPORT_DOMPURIFY_CONFIG } from '../config'
import { sanitize } from '../utils'

export const getSanitizeHtml = (markdown: string, options: Record<string, unknown>) => {
  const html = marked(markdown, options)
  return sanitize(html, EXPORT_DOMPURIFY_CONFIG, false)
}
