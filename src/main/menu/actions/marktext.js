import { autoUpdater } from 'electron-updater'
import { ipcMain, BrowserWindow, Menu } from 'electron'
import log from 'electron-log'
import { isUpdatable } from 'common/updates/isUpdatable'
import { COMMANDS } from '../../commands'
import { isOsx } from '../../config'

const BACKGROUND_UPDATE_DELAY = 15000
const BACKGROUND_UPDATE_INTERVAL = 1000 * 60 * 60 * 6

let runningUpdate = false
let updateWindow = null
let backgroundUpdateTimer = null
let backgroundUpdateInterval = null
let lastUpdateSource = 'manual'

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true
autoUpdater.logger = log

const canUseAutoUpdates = () => {
  return BrowserWindow.getAllWindows().length > 0 && isUpdatable()
}

const getUpdateWindow = () => {
  if (updateWindow && !updateWindow.isDestroyed()) {
    return updateWindow
  }

  const focusedWindow = BrowserWindow.getFocusedWindow()
  if (focusedWindow && !focusedWindow.isDestroyed()) {
    updateWindow = focusedWindow
    return updateWindow
  }

  updateWindow = BrowserWindow.getAllWindows().find((window) => !window.isDestroyed()) || null
  return updateWindow
}

const resetUpdateState = () => {
  runningUpdate = false
  lastUpdateSource = 'manual'
}

const notifyUpdate = (channel, message, { manualOnly = false } = {}) => {
  if (manualOnly && lastUpdateSource !== 'manual') {
    return
  }

  const win = getUpdateWindow()
  if (win) {
    win.webContents.send(channel, message)
  }
}

autoUpdater.on('error', (error) => {
  log.error('Auto update failed:', error)

  if (lastUpdateSource === 'manual') {
    notifyUpdate('mt::UPDATE_ERROR', error === null ? 'Error: unknown' : (error.message || error).toString())
  }

  resetUpdateState()
})

autoUpdater.on('update-available', (info) => {
  const version = info?.version ? `Vien ${info.version}` : 'The latest Vien release'
  notifyUpdate('mt::UPDATE_AVAILABLE', `${version} is downloading in the background.`)
})

autoUpdater.on('update-not-available', () => {
  notifyUpdate('mt::UPDATE_NOT_AVAILABLE', 'Vien is already up to date.', { manualOnly: true })
  resetUpdateState()
})

autoUpdater.on('update-downloaded', (info) => {
  const version = info?.version ? `Vien ${info.version}` : 'The latest Vien update'
  notifyUpdate('mt::UPDATE_DOWNLOADED', `${version} is ready to install. Restart now or later.`)
  resetUpdateState()
})

ipcMain.on('mt::NEED_UPDATE', (_e, { needUpdate }) => {
  if (needUpdate && !autoUpdater.autoDownload) {
    autoUpdater.downloadUpdate()
  }
})

ipcMain.on('mt::INSTALL_UPDATE_NOW', () => {
  setImmediate(() => autoUpdater.quitAndInstall())
})

ipcMain.on('mt::check-for-update', (e) => {
  const win = BrowserWindow.fromWebContents(e.sender)
  checkUpdates(win)
})

// --------------------------------------------------------

export const userSetting = () => {
  ipcMain.emit('app-create-settings-window')
}

export const setUpdateWindow = (browserWindow) => {
  updateWindow = browserWindow ?? null
}

export const startAutoUpdateChecks = (browserWindow) => {
  if (!canUseAutoUpdates() || backgroundUpdateTimer || backgroundUpdateInterval) {
    return false
  }

  setUpdateWindow(browserWindow)

  backgroundUpdateTimer = setTimeout(() => {
    backgroundUpdateTimer = null
    checkUpdates(getUpdateWindow(), { source: 'background' })
  }, BACKGROUND_UPDATE_DELAY)

  backgroundUpdateInterval = setInterval(() => {
    checkUpdates(getUpdateWindow(), { source: 'background' })
  }, BACKGROUND_UPDATE_INTERVAL)

  return true
}

export const checkUpdates = (browserWindow, { source = 'manual' } = {}) => {
  if (!canUseAutoUpdates()) {
    if (source === 'manual') {
      setUpdateWindow(browserWindow)
      notifyUpdate(
        'mt::UPDATE_ERROR',
        'Auto updates are available in the signed Vien app installed from the official GitHub release.',
      )
    }
    return false
  }

  if (!runningUpdate) {
    runningUpdate = true
    lastUpdateSource = source
    setUpdateWindow(browserWindow)
    autoUpdater.checkForUpdates().catch((error) => {
      log.error('Failed to start update check:', error)

      if (source === 'manual') {
        notifyUpdate('mt::UPDATE_ERROR', (error?.message || error || 'Error: unknown').toString())
      }

      resetUpdateState()
    })
    return true
  }

  return false
}

export const osxHide = () => {
  if (isOsx) {
    Menu.sendActionToFirstResponder('hide:')
  }
}

export const osxHideAll = () => {
  if (isOsx) {
    Menu.sendActionToFirstResponder('hideOtherApplications:')
  }
}

export const osxShowAll = () => {
  if (isOsx) {
    Menu.sendActionToFirstResponder('unhideAllApplications:')
  }
}

// --- Commands -------------------------------------------------------------

export const loadMarktextCommands = (commandManager) => {
  commandManager.add(COMMANDS.MT_HIDE, osxHide)
  commandManager.add(COMMANDS.MT_HIDE_OTHERS, osxHideAll)
}
