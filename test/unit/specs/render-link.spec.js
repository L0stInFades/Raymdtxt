// @vitest-environment node

import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../src/muya/lib/utils/url.ts', () => ({
  sanitizeHyperlink: (value) => value,
}))

const { default: renderLink } = await import('../../../src/muya/lib/parser/render/renderInlines/link.ts')

const h = (sel, dataOrChildren, children) => {
  if (Array.isArray(dataOrChildren) || typeof dataOrChildren === 'string') {
    return {
      sel,
      data: {},
      children: Array.isArray(dataOrChildren) ? dataOrChildren : [dataOrChildren],
    }
  }

  return {
    sel,
    data: dataOrChildren || {},
    children: children || [],
  }
}

const createRenderContext = () => ({
  getClassName() {
    return 'ag-gray'
  },
  highlight(_h, _block, start, end) {
    return [`${start}:${end}`]
  },
  backlashInToken() {
    return []
  },
  text(_h, _cursor, _block, token) {
    return [token.content]
  },
})

describe('inline link rendering', () => {
  it('keeps href markup inside removable bracket spans', () => {
    const token = {
      raw: '[TypeScript 是什么](#1-typescript-是什么)',
      type: 'link',
      anchor: 'TypeScript 是什么',
      href: '#1-typescript-是什么',
      hrefAndTitle: '#1-typescript-是什么',
      title: '',
      range: {
        start: 0,
        end: 37,
      },
      backlash: {
        first: '',
        second: '',
      },
      children: [
        {
          type: 'text',
          content: 'TypeScript 是什么',
        },
      ],
    }

    const nodes = renderLink.call(
      createRenderContext(),
      h,
      { start: { key: 'a', offset: 0 }, end: { key: 'a', offset: 0 } },
      { key: 'a' },
      token,
      '',
    )

    expect(nodes[1].sel).toBe('a.ag-inline-rule')
    expect(nodes[3].sel).toBe('span.ag-link-in-bracket.ag-remove')
    expect(nodes[4].sel).toBe('span.ag-gray.ag-remove')
  })
})
