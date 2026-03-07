import fs from 'node:fs'
import path from 'node:path'
import EventEmitter from 'node:events'
import { BrowserWindow, ipcMain, dialog } from 'electron'
import keytar from 'keytar'
import schema from './schema'
import Store from 'electron-store'
import log from 'electron-log'
import { ensureDirSync } from 'common/filesystem'
import { IMAGE_EXTENSIONS } from 'common/filesystem/paths'

const DATA_CENTER_NAME = 'dataCenter'

class DataCenter extends EventEmitter {
  constructor(paths) {
    super()

    const { dataCenterPath, userDataPath } = paths
    this.dataCenterPath = dataCenterPath
    this.userDataPath = userDataPath
    this.serviceName = 'vien'
    this.legacyServiceNames = ['marktext']
    this.encryptKeys = ['githubToken']
    this.hasDataCenterFile = fs.existsSync(path.join(this.dataCenterPath, `./${DATA_CENTER_NAME}.json`))
    this.store = new Store({
      schema,
      name: DATA_CENTER_NAME,
    })

    this.init()
  }

  init() {
    const defaultData = {
      imageFolderPath: path.join(this.userDataPath, 'images'),
      screenshotFolderPath: path.join(this.userDataPath, 'screenshot'),
      webImages: [],
      cloudImages: [],
      currentUploader: 'none',
      imageBed: {
        github: {
          owner: '',
          repo: '',
          branch: '',
        },
      },
    }

    if (!this.hasDataCenterFile) {
      this.store.set(defaultData)
      ensureDirSync(this.store.get('screenshotFolderPath'))
    }
    this._listenForIpcMain()
  }

  async getAll() {
    const { encryptKeys } = this
    const data = this.store.store
    try {
      const encryptData = await Promise.all(
        encryptKeys.map((key) => {
          return this._getSecureValue(key)
        }),
      )
      const encryptObj = Object.fromEntries(encryptKeys.map((key, index) => [key, encryptData[index]]))

      return Object.assign(data, encryptObj)
    } catch (err) {
      log.error('Failed to decrypt secure keys:', err)
      return data
    }
  }

  addImage(key, url) {
    const items = this.store.get(key)
    const alreadyHas = items.some((item) => item.url === url)
    let item
    if (alreadyHas) {
      item = items.find((item) => item.url === url)
      item.timeStamp = Date.now()
    } else {
      item = {
        url,
        timeStamp: Date.now(),
      }
      items.push(item)
    }

    ipcMain.emit('broadcast-web-image-added', { type: key, item })
    return this.store.set(key, items)
  }

  removeImage(type, url) {
    const items = this.store.get(type)
    const index = items.indexOf(url)
    const item = items[index]
    if (index === -1) return
    items.splice(index, 1)
    ipcMain.emit('broadcast-web-image-removed', { type, item })
    return this.store.set(type, items)
  }

  /**
   *
   * @param {string} key
   * return a promise
   */
  getItem(key) {
    const { encryptKeys } = this
    if (encryptKeys.includes(key)) {
      return this._getSecureValue(key)
    } else {
      const value = this.store.get(key)
      return Promise.resolve(value)
    }
  }

  async setItem(key, value) {
    const { encryptKeys, serviceName } = this
    if (key === 'screenshotFolderPath') {
      ensureDirSync(value)
    }
    ipcMain.emit('broadcast-user-data-changed', { [key]: value })
    if (encryptKeys.includes(key)) {
      try {
        return await keytar.setPassword(serviceName, key, value)
      } catch (err) {
        log.error('Keytar error:', err)
      }
    } else {
      return this.store.set(key, value)
    }
  }

  async _getSecureValue(key) {
    const { serviceName, legacyServiceNames } = this
    const currentValue = await keytar.getPassword(serviceName, key)
    if (currentValue) {
      return currentValue
    }

    for (const legacyServiceName of legacyServiceNames) {
      const legacyValue = await keytar.getPassword(legacyServiceName, key)
      if (legacyValue) {
        try {
          await keytar.setPassword(serviceName, key, legacyValue)
        } catch (err) {
          log.error(`Failed to migrate secure key "${key}" from ${legacyServiceName} to ${serviceName}:`, err)
        }
        return legacyValue
      }
    }

    return null
  }

  /**
   * Change multiple setting entries.
   *
   * @param {Object.<string, *>} settings A settings object or subset object with key/value entries.
   */
  setItems(settings) {
    if (!settings) {
      log.error('Cannot change settings without entires: object is undefined or null.')
      return
    }

    Object.keys(settings).forEach((key) => {
      this.setItem(key, settings[key])
    })
  }

  _listenForIpcMain() {
    // local main events
    ipcMain.on('set-image-folder-path', (newPath) => {
      this.setItem('imageFolderPath', newPath)
    })

    // events from renderer process
    ipcMain.on('mt::ask-for-user-data', async (e) => {
      const win = BrowserWindow.fromWebContents(e.sender)
      const userData = await this.getAll()
      win.webContents.send('mt::user-preference', userData)
    })

    ipcMain.on('mt::ask-for-modify-image-folder-path', async (e, imagePath) => {
      if (!imagePath) {
        const win = BrowserWindow.fromWebContents(e.sender)
        const { filePaths } = await dialog.showOpenDialog(win, {
          properties: ['openDirectory', 'createDirectory'],
        })
        if (filePaths?.[0]) {
          imagePath = filePaths[0]
        }
      }
      if (imagePath) {
        this.setItem('imageFolderPath', imagePath)
      }
    })

    ipcMain.on('mt::set-user-data', (_e, userData) => {
      this.setItems(userData)
    })

    ipcMain.handle('mt::ask-for-image-path', async (e) => {
      const win = BrowserWindow.fromWebContents(e.sender)
      const { filePaths } = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [
          {
            name: 'Images',
            extensions: IMAGE_EXTENSIONS,
          },
        ],
      })
      return filePaths?.[0] ? filePaths[0] : ''
    })
  }
}

export default DataCenter
