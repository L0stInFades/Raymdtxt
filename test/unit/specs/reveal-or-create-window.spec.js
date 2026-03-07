import { describe, expect, it, vi } from 'vitest'
import { revealOrCreateWindow } from '../../../src/main/app/revealOrCreateWindow.js'

const createWindowManager = ({ activeWindow = undefined, activeEditor = undefined, windows = [] } = {}) => {
  return {
    getActiveWindow: vi.fn(() => activeWindow),
    getActiveEditor: vi.fn(() => activeEditor),
    windows: new Map(windows.map((window, index) => [index + 1, window])),
  }
}

describe('revealOrCreateWindow', () => {
  it('brings the active window to the front when one exists', () => {
    const activeWindow = { bringToFront: vi.fn() }
    const createWindow = vi.fn()
    const windowManager = createWindowManager({ activeWindow })

    const result = revealOrCreateWindow(windowManager, createWindow)

    expect(result).toBe(activeWindow)
    expect(activeWindow.bringToFront).toHaveBeenCalledTimes(1)
    expect(createWindow).not.toHaveBeenCalled()
  })

  it('falls back to the last active editor when no generic active window is registered', () => {
    const editorWindow = { bringToFront: vi.fn() }
    const createWindow = vi.fn()
    const windowManager = createWindowManager({ activeEditor: editorWindow })

    const result = revealOrCreateWindow(windowManager, createWindow)

    expect(result).toBe(editorWindow)
    expect(editorWindow.bringToFront).toHaveBeenCalledTimes(1)
    expect(createWindow).not.toHaveBeenCalled()
  })

  it('falls back to the first tracked window before creating a new one', () => {
    const firstWindow = { bringToFront: vi.fn() }
    const createWindow = vi.fn()
    const windowManager = createWindowManager({ windows: [firstWindow] })

    const result = revealOrCreateWindow(windowManager, createWindow)

    expect(result).toBe(firstWindow)
    expect(firstWindow.bringToFront).toHaveBeenCalledTimes(1)
    expect(createWindow).not.toHaveBeenCalled()
  })

  it('creates a fresh editor window when the application has none left', () => {
    const createdWindow = { id: 'new-window' }
    const createWindow = vi.fn(() => createdWindow)
    const windowManager = createWindowManager()

    const result = revealOrCreateWindow(windowManager, createWindow)

    expect(result).toBe(createdWindow)
    expect(createWindow).toHaveBeenCalledTimes(1)
  })
})
