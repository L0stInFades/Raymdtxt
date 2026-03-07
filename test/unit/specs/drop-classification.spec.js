// @vitest-environment node

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const { classifyDroppedPaths } = await import('../../../src/main/menu/actions/drop.js')

describe('classifyDroppedPaths', () => {
  it('separates markdown, folders, importable documents, and unsupported files', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'vien-drop-'))

    try {
      const draftPath = path.join(root, 'draft.md')
      const folderPath = path.join(root, 'notes')
      const importablePath = path.join(root, 'outline.docx')
      const unsupportedPath = path.join(root, 'preview.png')

      writeFileSync(draftPath, '# draft\n')
      mkdirSync(folderPath)
      writeFileSync(importablePath, 'binary-ish')
      writeFileSync(unsupportedPath, 'not supported')

      expect(classifyDroppedPaths([draftPath, folderPath, importablePath, unsupportedPath, draftPath])).toEqual({
        openPaths: [draftPath, folderPath],
        importPaths: [importablePath],
        unsupportedPaths: [unsupportedPath],
      })
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
