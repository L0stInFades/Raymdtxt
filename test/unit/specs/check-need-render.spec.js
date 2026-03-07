// @vitest-environment node

import { describe, expect, it } from 'vitest'

const { default: updateCtrl } = await import('../../../src/muya/lib/contentState/updateCtrl.ts')

describe('checkNeedRender', () => {
  it('returns false when the cursor points to a missing block', () => {
    class FakeContentState {
      constructor() {
        this.cursor = {
          start: { key: 'missing', offset: 0 },
          end: { key: 'missing', offset: 0 },
        }
        this.stateRender = { labels: new Map() }
        this.muya = { options: {} }
      }

      getBlock() {
        return null
      }
    }

    updateCtrl(FakeContentState)

    const contentState = new FakeContentState()
    expect(contentState.checkNeedRender()).toBe(false)
  })
})
