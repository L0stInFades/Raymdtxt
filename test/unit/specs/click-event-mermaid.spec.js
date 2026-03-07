// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'

const { default: ClickEvent } = await import('../../../src/muya/lib/eventHandler/clickEvent.ts')

const createContext = () => {
  document.body.innerHTML = '<div id="editor"></div>'
  const container = document.querySelector('#editor')
  const listeners = new Map()
  const eventCenter = {
    attachDOMEvent: vi.fn((_container, eventName, handler) => listeners.set(eventName, handler)),
    dispatch: vi.fn(),
  }
  const contentState = {
    selectedImage: null,
    selectedTableCells: null,
    handleContainerBlockClick: vi.fn(),
    clickHandler: vi.fn(),
    selectImage: vi.fn(),
    deleteImage: vi.fn(),
    listItemCheckBoxClick: vi.fn(),
    tableToolBarClick: vi.fn(),
  }

  new ClickEvent({
    container,
    eventCenter,
    contentState,
  })

  return { container, listeners, contentState }
}

describe('click event mermaid preview behavior', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('keeps Mermaid previews in preview mode when clicked', () => {
    const { container, listeners, contentState } = createContext()
    container.innerHTML = `
      <figure id="figure-1" data-role="MERMAID" class="ag-container-block">
        <div class="ag-container-preview"><span class="target">preview</span></div>
      </figure>
    `

    const handler = listeners.get('click')
    const event = {
      target: container.querySelector('.target'),
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    }

    handler(event)

    expect(event.preventDefault).toHaveBeenCalledOnce()
    expect(event.stopPropagation).toHaveBeenCalledOnce()
    expect(contentState.handleContainerBlockClick).not.toHaveBeenCalled()
    expect(contentState.clickHandler).not.toHaveBeenCalled()
  })

  it('still opens other container previews into code editing when clicked', () => {
    const { container, listeners, contentState } = createContext()
    container.innerHTML = `
      <figure id="figure-2" data-role="FLOWCHART" class="ag-container-block">
        <div class="ag-container-preview"><span class="target">preview</span></div>
      </figure>
    `

    const handler = listeners.get('click')
    const event = {
      target: container.querySelector('.target'),
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    }

    handler(event)

    expect(event.preventDefault).toHaveBeenCalledOnce()
    expect(event.stopPropagation).toHaveBeenCalledOnce()
    expect(contentState.handleContainerBlockClick).toHaveBeenCalledWith(container.querySelector('#figure-2'))
    expect(contentState.clickHandler).not.toHaveBeenCalled()
  })
})
