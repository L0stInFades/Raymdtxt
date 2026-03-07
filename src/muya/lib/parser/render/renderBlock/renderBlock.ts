import type { StateRenderContext, HighlightRange } from '../renderContext'
import type { Block } from '../../types'

/**
 * [renderBlock render one block, no matter it is a container block or text block]
 */
export default function renderBlock(
  this: StateRenderContext,
  parent: Block | null,
  block: Block,
  activeBlocks: Block[],
  matches: HighlightRange[],
  useCache = false,
) {
  const method = Array.isArray(block.children) && block.children.length > 0 ? 'renderContainerBlock' : 'renderLeafBlock'

  return this[method](parent, block, activeBlocks, matches, useCache)
}
