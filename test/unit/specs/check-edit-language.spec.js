// @vitest-environment node

import { afterEach, describe, expect, it, vi } from 'vitest'

const getCursorRange = vi.fn()

vi.mock('../../../src/muya/lib/selection', () => ({
  default: {
    getCursorRange,
  },
}))

const { default: codeBlockCtrl } = await import('../../../src/muya/lib/contentState/codeBlockCtrl.ts')

describe('checkEditLanguage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    getCursorRange.mockReset()
  })

  it('returns an empty language state when the selection points to a missing block', () => {
    class FakeContentState {
      getBlock() {
        return null
      }
    }

    codeBlockCtrl(FakeContentState)
    getCursorRange.mockReturnValue({
      start: { key: 'missing', offset: 0 },
      end: { key: 'missing', offset: 0 },
    })
    vi.stubGlobal('document', {
      querySelector: vi.fn(() => null),
    })

    const contentState = new FakeContentState()
    const result = contentState.checkEditLanguage()

    expect(result).toEqual({
      lang: null,
      paragraph: null,
    })
  })
})
