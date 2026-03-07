// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'

const { default: containerCtrl } = await import('../../../src/muya/lib/contentState/containerCtrl.ts')
const { default: renderContainerBlock } = await import(
  '../../../src/muya/lib/parser/render/renderBlock/renderContainerBlock.ts'
)

describe('mermaid container mode', () => {
  it('enters explicit edit mode when opening a mermaid container block', () => {
    function TestContentState() {}
    containerCtrl(TestContentState)

    const firstLine = { key: 'line-1' }
    const figureBlock = {
      key: 'figure-1',
      functionType: 'mermaid',
      children: [
        {
          children: [
            {
              children: [firstLine],
            },
          ],
        },
      ],
    }

    const contentState = new TestContentState()
    contentState.getBlock = vi.fn((key) => (key === 'figure-1' ? figureBlock : null))
    contentState.partialRender = vi.fn()
    contentState.editingContainerKey = null
    contentState.cursor = null

    contentState.handleContainerBlockClick({ id: 'figure-1' })

    expect(contentState.editingContainerKey).toBe('figure-1')
    expect(contentState.cursor).toEqual({
      start: { key: 'line-1', offset: 0 },
      end: { key: 'line-1', offset: 0 },
    })
    expect(contentState.partialRender).toHaveBeenCalledOnce()
  })

  it('keeps non-mermaid container blocks out of explicit mermaid edit mode', () => {
    function TestContentState() {}
    containerCtrl(TestContentState)

    const firstLine = { key: 'line-1' }
    const figureBlock = {
      key: 'figure-1',
      functionType: 'flowchart',
      children: [
        {
          children: [
            {
              children: [firstLine],
            },
          ],
        },
      ],
    }

    const contentState = new TestContentState()
    contentState.getBlock = vi.fn((key) => (key === 'figure-1' ? figureBlock : null))
    contentState.partialRender = vi.fn()
    contentState.editingContainerKey = 'existing-mermaid'
    contentState.cursor = null

    contentState.handleContainerBlockClick({ id: 'figure-1' })

    expect(contentState.editingContainerKey).toBeNull()
    expect(contentState.cursor).toEqual({
      start: { key: 'line-1', offset: 0 },
      end: { key: 'line-1', offset: 0 },
    })
    expect(contentState.partialRender).toHaveBeenCalledOnce()
  })

  it('marks the mermaid figure as editing only for the active editing block', () => {
    const context = {
      getSelector: () => 'figure#figure-1.ag-paragraph.ag-active',
      renderBlock: vi.fn((_parent, child) => ({ sel: `${child.type}#${child.key}` })),
      renderIcon: () => null,
      muya: {
        contentState: {
          editingContainerKey: 'figure-1',
          cursor: {
            start: { key: 'figure-1', offset: 0 },
            end: { key: 'figure-1', offset: 0 },
          },
          selectedBlock: null,
          selectedImage: null,
          selectedTableCells: null,
        },
        options: {},
      },
      renderingRowContainer: null,
      renderingTable: null,
      codeCache: new Map(),
      mermaidCache: new Map(),
    }

    const figureBlock = {
      key: 'figure-1',
      type: 'figure',
      text: '',
      editable: true,
      parent: null,
      preSibling: null,
      nextSibling: null,
      functionType: 'mermaid',
      children: [
        {
          key: 'pre-1',
          type: 'pre',
          text: '',
          editable: true,
          parent: 'figure-1',
          preSibling: null,
          nextSibling: 'preview-1',
          functionType: 'mermaid',
          children: [],
        },
        {
          key: 'preview-1',
          type: 'div',
          text: '',
          editable: false,
          parent: 'figure-1',
          preSibling: 'pre-1',
          nextSibling: null,
          functionType: 'mermaid',
          children: [],
        },
      ],
    }

    const vnode = renderContainerBlock.call(context, null, figureBlock, [], [], false)

    expect(vnode.sel).toContain('.ag-editing')
  })
})
