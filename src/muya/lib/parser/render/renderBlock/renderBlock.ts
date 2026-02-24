import type { Block } from '../../types'

/**
 * [renderBlock render one block, no matter it is a container block or text block]
 */
export default function renderBlock(
 // biome-ignore lint/suspicious/noExplicitAny: mixin method — `this` is StateRender with dynamic render methods
 this: any,
 parent: Block | null,
 block: Block,
 activeBlocks: Block[],
 matches: { key: string; start: number; end: number; active: boolean }[],
 useCache = false
) {
  const method = Array.isArray(block.children) && block.children.length > 0 ? 'renderContainerBlock' : 'renderLeafBlock'

  return this[method](parent, block, activeBlocks, matches, useCache)
}
