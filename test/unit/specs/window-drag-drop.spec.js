// @vitest-environment node

import { describe, expect, it } from 'vitest'

const { getDroppedPaths, hasFileTransfer, isImageOnlyFileDrop, shouldUseWindowFileDropOverlay } = await import(
  '../../../src/renderer/util/windowDragDrop.ts'
)

describe('window drag drop helpers', () => {
  it('shows the window overlay for document and folder drops', () => {
    const dataTransfer = {
      types: ['Files'],
      items: [
        { kind: 'file', type: 'text/markdown' },
        { kind: 'file', type: '' },
      ],
    }

    expect(hasFileTransfer(dataTransfer)).toBe(true)
    expect(isImageOnlyFileDrop(dataTransfer)).toBe(false)
    expect(shouldUseWindowFileDropOverlay(dataTransfer)).toBe(true)
  })

  it('skips the window overlay for image-only drags', () => {
    const dataTransfer = {
      types: ['Files'],
      items: [
        { kind: 'file', type: 'image/png' },
        { kind: 'file', type: 'image/jpeg' },
      ],
    }

    expect(isImageOnlyFileDrop(dataTransfer)).toBe(true)
    expect(shouldUseWindowFileDropOverlay(dataTransfer)).toBe(false)
  })

  it('extracts unique native file paths from dropped files', () => {
    const dataTransfer = {
      files: [{ path: '/tmp/alpha.md' }, { path: '/tmp/alpha.md' }, { path: '' }, {}, { path: '/tmp/beta.docx' }],
    }

    expect(getDroppedPaths(dataTransfer)).toEqual(['/tmp/alpha.md', '/tmp/beta.docx'])
  })
})
