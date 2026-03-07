// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'

const { default: Muya } = await import('../../../src/muya/lib/index.ts')

describe('Muya search', () => {
  it('defaults search options when none are provided', () => {
    const search = vi.fn()
    const render = vi.fn()
    const searchMatches = { value: '', matches: [], index: -1 }

    const result = Muya.prototype.search.call(
      {
        contentState: {
          search,
          render,
          searchMatches,
        },
      },
      'typescript',
    )

    expect(search).toHaveBeenCalledWith('typescript', {})
    expect(render).toHaveBeenCalledWith(false)
    expect(result).toBe(searchMatches)
  })
})
