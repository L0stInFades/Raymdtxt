// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'

const getCursorCoords = vi.fn(() => ({ left: 0, top: 0 }))

vi.mock('../../../src/muya/lib/selection', () => ({
  default: {
    getCursorRange: vi.fn(),
    getCursorCoords,
  },
}))

const { default: paragraphCtrl } = await import('../../../src/muya/lib/contentState/paragraphCtrl.ts')

describe('selectionChange', () => {
  it('falls back to an available block when the cursor points to a missing block', () => {
    const fallbackBlock = {
      key: 'fallback',
      type: 'p',
      children: [],
      parent: null,
      preSibling: null,
      nextSibling: null,
    }

    class FakeContentState {
      constructor() {
        this.blocks = [fallbackBlock]
      }

      getBlock(key) {
        return key === fallbackBlock.key ? fallbackBlock : null
      }

      getParent() {
        return null
      }

      getParents(block) {
        return block ? [block] : []
      }
    }

    paragraphCtrl(FakeContentState)

    const contentState = new FakeContentState()
    const result = contentState.selectionChange({
      start: { key: 'missing', offset: 0 },
      end: { key: fallbackBlock.key, offset: 0 },
    })

    expect(result.start.block).toBe(fallbackBlock)
    expect(result.end.block).toBe(fallbackBlock)
    expect(result.start.type).toBe('p')
    expect(result.end.type).toBe('p')
    expect(result.affiliation).toEqual([fallbackBlock])
  })
})
