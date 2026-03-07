// @vitest-environment node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { EventEmitter } from 'node:events'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const ipcHandlers = new Map()
const ipcMain = new EventEmitter()
ipcMain.handle = vi.fn((channel, handler) => {
  ipcHandlers.set(channel, handler)
})
ipcMain.invoke = async (channel, ...args) => {
  const handler = ipcHandlers.get(channel)
  if (!handler) {
    throw new Error(`No IPC handler registered for ${channel}`)
  }
  return handler(...args)
}

const app = {
  addRecentDocument: vi.fn(),
  clearRecentDocuments: vi.fn(),
}

const menuStub = {
  getMenuItemById: vi.fn(() => ({
    checked: false,
    enabled: true,
    submenu: { items: [] },
  })),
}

vi.mock('electron', () => ({
  Menu: {
    buildFromTemplate: vi.fn(() => menuStub),
    setApplicationMenu: vi.fn(),
    getApplicationMenu: vi.fn(() => menuStub),
  },
  app,
  ipcMain,
}))

vi.mock('../../../src/main/config.js', () => ({
  isOsx: true,
  isWindows: false,
  isLinux: false,
}))

vi.mock('../../../src/main/menu/templates/index.js', () => ({
  __esModule: true,
  default: vi.fn(() => []),
  configSettingMenu: vi.fn(() => []),
}))

const { default: AppMenu } = await import('../../../src/main/menu/index.js')

const createTempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'vien-menu-spec-'))

const createTestFile = (pathname, content = '# test\n') => {
  fs.mkdirSync(path.dirname(pathname), { recursive: true })
  fs.writeFileSync(pathname, content, 'utf8')
}

describe('AppMenu recently used documents', () => {
  beforeEach(() => {
    ipcHandlers.clear()
    ipcMain.removeAllListeners()
    ipcMain.handle.mockClear()
    app.addRecentDocument.mockClear()
    app.clearRecentDocuments.mockClear()
  })

  it('persists, deduplicates, and truncates recent documents even on macOS', () => {
    const userDataPath = createTempDir()
    const workspacePath = createTempDir()
    const filePaths = Array.from({ length: 14 }, (_, index) => path.join(workspacePath, `doc-${index}.md`))

    for (const filePath of filePaths) {
      createTestFile(filePath)
    }

    const appMenu = new AppMenu({}, {}, userDataPath)
    appMenu.updateAppMenu = vi.fn()

    for (const filePath of filePaths) {
      appMenu.addRecentlyUsedDocument(filePath)
    }

    appMenu.addRecentlyUsedDocument(filePaths[4])

    const recentsPath = path.join(userDataPath, 'recently-used-documents.json')
    const recentDocuments = JSON.parse(fs.readFileSync(recentsPath, 'utf8'))

    expect(app.addRecentDocument).toHaveBeenCalled()
    expect(recentDocuments).toHaveLength(12)
    expect(new Set(recentDocuments).size).toBe(12)
    expect(recentDocuments[0]).toBe(filePaths[4])
    expect(recentDocuments).not.toContain(filePaths[0])
    expect(recentDocuments).not.toContain(filePaths[1])
  })

  it('projects recents through IPC and clears persisted data', async () => {
    const userDataPath = createTempDir()
    const workspacePath = createTempDir()
    const filePath = path.join(workspacePath, 'draft.md')
    const folderPath = path.join(workspacePath, 'notes')

    createTestFile(filePath)
    fs.mkdirSync(folderPath, { recursive: true })

    const appMenu = new AppMenu({}, {}, userDataPath)
    appMenu.updateAppMenu = vi.fn()

    appMenu.addRecentlyUsedDocument(filePath)
    appMenu.addRecentlyUsedDocument(folderPath)

    const recentItems = await ipcMain.invoke('mt::get-recently-used-documents')
    expect(recentItems).toEqual([
      {
        pathname: folderPath,
        name: 'notes',
        parentPath: workspacePath,
        kind: 'folder',
      },
      {
        pathname: filePath,
        name: 'draft.md',
        parentPath: workspacePath,
        kind: 'file',
      },
    ])

    ipcMain.emit('mt::clear-recently-used-documents')

    const recentsPath = path.join(userDataPath, 'recently-used-documents.json')
    expect(JSON.parse(fs.readFileSync(recentsPath, 'utf8'))).toEqual([])
    expect(app.clearRecentDocuments).toHaveBeenCalled()
  })
})
