// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'

const getCursorRange = vi.fn()

vi.mock('../../../src/muya/lib/selection', () => ({
  default: {
    getCursorRange,
  },
}))

const { default: formatCtrl } = await import('../../../src/muya/lib/contentState/formatCtrl.ts')

describe('selectionFormats', () => {
  it('returns empty formatting state when the selection points to a missing block', () => {
    class FakeContentState {
      constructor() {
        this.muya = { options: {} }
      }

      getBlock() {
        return null
      }
    }

    formatCtrl(FakeContentState)

    const contentState = new FakeContentState()
    const result = contentState.selectionFormats({
      start: { key: 'missing', offset: 0 },
      end: { key: 'missing', offset: 0 },
    })

    expect(result).toEqual({
      formats: [],
      tokens: [],
      neighbors: [],
    })
  })
})
