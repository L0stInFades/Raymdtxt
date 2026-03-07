// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'

const { default: renderLeafBlock } = await import('../../../src/muya/lib/parser/render/renderBlock/renderLeafBlock.ts')
const { default: text } = await import('../../../src/muya/lib/parser/render/renderInlines/text.ts')
const { default: link } = await import('../../../src/muya/lib/parser/render/renderInlines/link.ts')

describe('renderLeafBlock', () => {
  it('binds the render context for inline token renderers', () => {
    const highlight = vi.fn(() => ['ok'])
    const context = {
      codeCache: new Map(),
      container: null,
      diagramCache: new Map(),
      eventCenter: null,
      labels: new Map(),
      loadImageMap: new Map(),
      loadMathMap: new Map(),
      mermaidCache: new Map(),
      muya: {
        contentState: {
          cursor: {
            start: { key: 'block-1', offset: 0 },
            end: { key: 'block-1', offset: 0 },
          },
          selectedBlock: null,
          selectedTableCells: null,
          selectedImage: null,
        },
        options: {},
      },
      renderingRowContainer: null,
      renderingTable: null,
      tokenCache: new Map([
        [
          'hello',
          [
            {
              type: 'text',
              range: { start: 0, end: 5 },
            },
          ],
        ],
      ]),
      urlMap: new Map(),
      getSelector: () => 'span#block-1',
      renderIcon: () => null,
      highlight,
      text,
    }

    const block = {
      key: 'block-1',
      text: 'hello',
      type: 'span',
      functionType: 'paragraphContent',
      editable: true,
      parent: null,
    }

    renderLeafBlock.call(context, null, block, [], [], false)

    expect(highlight).toHaveBeenCalledOnce()
  })

  it('binds the render context for nested inline token renderers inside links', () => {
    const highlight = vi.fn(() => ['ok'])
    const h = vi.fn((selector, children) => ({ selector, children }))
    const context = {
      highlight,
      getClassName: () => 'ag-gray',
      backlashInToken: () => [],
      text,
    }
    const cursor = {
      start: { key: 'block-1', offset: 0 },
      end: { key: 'block-1', offset: 0 },
    }
    const block = {
      key: 'block-1',
      text: '[hello](https://vien)',
      type: 'span',
      functionType: 'paragraphContent',
    }
    const token = {
      range: { start: 0, end: 21 },
      anchor: 'hello',
      backlash: { first: '', second: '' },
      children: [{ type: 'text', range: { start: 1, end: 6 } }],
      hrefAndTitle: 'https://vien',
      href: 'https://vien',
      title: '',
      raw: '[hello](https://vien)',
    }

    link.call(context, h, cursor, block, token, '')

    expect(highlight).toHaveBeenCalled()
  })
})
