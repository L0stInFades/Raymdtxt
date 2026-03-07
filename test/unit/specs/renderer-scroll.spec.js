// @vitest-environment node

import { describe, expect, it } from 'vitest'

const { getScrollTopForElement } = await import('../../../src/renderer/util/index.ts')

describe('getScrollTopForElement', () => {
  it('computes scroll offset relative to the editor container', () => {
    const container = {
      scrollTop: 480,
      scrollHeight: 2000,
      clientHeight: 600,
      getBoundingClientRect() {
        return { top: 80 }
      },
    }
    const target = {
      getBoundingClientRect() {
        return { top: 860 }
      },
    }

    expect(getScrollTopForElement(container, target, 200)).toBe(1060)
  })

  it('clamps scroll offset into the container bounds', () => {
    const container = {
      scrollTop: 20,
      scrollHeight: 900,
      clientHeight: 400,
      getBoundingClientRect() {
        return { top: 100 }
      },
    }
    const aboveTarget = {
      getBoundingClientRect() {
        return { top: 40 }
      },
    }
    const belowTarget = {
      getBoundingClientRect() {
        return { top: 1200 }
      },
    }

    expect(getScrollTopForElement(container, aboveTarget, 120)).toBe(0)
    expect(getScrollTopForElement(container, belowTarget, 40)).toBe(500)
  })
})
