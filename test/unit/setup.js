// Pre-load Prism languages that are base dependencies for other languages.
// prism-cpp extends prism-c, which must be registered first.
// Without this, muya's dynamic prism loading triggers an unhandled rejection
// in the test environment.
import { resolve } from 'node:path'
import Prism from 'prismjs'
import 'prismjs/components/prism-c'
import { vi } from 'vitest'

const prismModuleId = resolve(process.cwd(), 'src/muya/lib/prism/index.ts')
const exportHtmlModuleId = resolve(process.cwd(), 'src/muya/lib/utils/exportHtml.ts')

vi.doMock(prismModuleId, async () => import('./mocks/prism.js'))
vi.doMock(exportHtmlModuleId, async () => import('./mocks/exportHtml.js'))

if (typeof window !== 'undefined') {
  window.Prism = Prism
}
