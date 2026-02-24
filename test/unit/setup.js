// Pre-load Prism languages that are base dependencies for other languages.
// prism-cpp extends prism-c, which must be registered first.
// Without this, muya's dynamic prism loading triggers an unhandled rejection
// in the test environment.
import Prism from 'prismjs'
import 'prismjs/components/prism-c'
window.Prism = Prism
