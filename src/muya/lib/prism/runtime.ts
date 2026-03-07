import Prism from 'prismjs'
import 'prismjs/plugins/keep-markup/prism-keep-markup'

if (typeof window !== 'undefined') {
  ;(window as unknown as Record<string, unknown>).Prism = Prism
}

export default Prism
