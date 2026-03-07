// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const isFile = vi.fn()

vi.mock('common/filesystem', () => ({
  isFile,
}))

const overrideProcessProperty = (key, value) => {
  const descriptor = Object.getOwnPropertyDescriptor(process, key)
  Object.defineProperty(process, key, {
    configurable: true,
    value,
  })

  return () => {
    if (descriptor) {
      Object.defineProperty(process, key, descriptor)
    } else {
      delete process[key]
    }
  }
}

describe('isUpdatable', () => {
  let restorePlatform = null
  let restoreResourcesPath = null

  beforeEach(() => {
    vi.resetModules()
    isFile.mockReset()
    delete process.env.APPIMAGE
  })

  afterEach(() => {
    restorePlatform?.()
    restoreResourcesPath?.()
    restorePlatform = null
    restoreResourcesPath = null
  })

  it('treats signed macOS app bundles with app-update.yml as updatable', async () => {
    restorePlatform = overrideProcessProperty('platform', 'darwin')
    restoreResourcesPath = overrideProcessProperty('resourcesPath', '/Applications/Vien.app/Contents/Resources')
    isFile.mockImplementation((pathname) => pathname.includes('app-update.yml'))

    const { isUpdatable } = await import('../../../src/common/updates/isUpdatable.js')

    expect(isUpdatable()).toBe(true)
  })

  it('keeps windows archive-style bundles disabled without installer assets', async () => {
    restorePlatform = overrideProcessProperty('platform', 'win32')
    restoreResourcesPath = overrideProcessProperty('resourcesPath', 'C:\\Vien\\resources')
    isFile.mockImplementation((pathname) => pathname.includes('app-update.yml'))

    const { isUpdatable } = await import('../../../src/common/updates/isUpdatable.js')

    expect(isUpdatable()).toBe(false)
  })
})
