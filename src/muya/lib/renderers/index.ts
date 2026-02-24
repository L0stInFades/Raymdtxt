const rendererCache = new Map<string, unknown>()
/**
 *
 * @param {string} name the renderer name: katex, sequence, plantuml, flowchart, mermaid, vega-lite
 */
const loadRenderer = async (name: string) => {
  if (!rendererCache.has(name)) {
    let m
    switch (name) {
      case 'sequence':
        m = await import('../parser/render/sequence')
        rendererCache.set(name, m.default)
        break
      case 'plantuml':
        m = await import('../parser/render/plantuml')
        rendererCache.set(name, m.default)
        break
      case 'flowchart':
        m = await import('flowchart.js')
        rendererCache.set(name, m.default)
        break
      case 'mermaid':
        // @ts-expect-error TS(7016): Could not find a declaration file for module 'merm... Remove this comment to see the full error message
        m = await import('mermaid/dist/mermaid.core.mjs')
        rendererCache.set(name, m.default)
        break
      case 'vega-lite':
        m = await import('vega-embed')
        rendererCache.set(name, m.default)
        break
      default:
        throw new Error(`Unknown diagram name ${name}`)
    }
  }

  return rendererCache.get(name)
}

export default loadRenderer
