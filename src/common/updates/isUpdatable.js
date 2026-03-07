import path from 'node:path'
import { isFile } from 'common/filesystem'

/// Check whether the current runtime can use electron-updater.
export const isUpdatable = () => {
  if (!process.resourcesPath) {
    return false
  }

  const updaterConfigPath = path.join(process.resourcesPath, 'app-update.yml')
  if (!isFile(updaterConfigPath)) {
    return false
  }

  if (process.env.APPIMAGE) {
    return true
  }

  if (process.platform === 'darwin') {
    return true
  }

  if (process.platform === 'win32') {
    // Windows bundles `app-update.yml` in more target types than the NSIS
    // installer, so keep the installer-specific file check there.
    return isFile(path.join(process.resourcesPath, 'md.ico'))
  }

  return false
}
