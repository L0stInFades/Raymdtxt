import { defineStore } from 'pinia'
import notice from '../../services/notification'

export const useAutoUpdatesStore = defineStore('autoUpdates', () => {
  function listen() {
    window.api.ipc.on('mt::UPDATE_ERROR', (message: unknown) => {
      notice.notify({
        title: 'Update',
        type: 'error',
        time: 10000,
        message: message as string,
      })
    })

    window.api.ipc.on('mt::UPDATE_NOT_AVAILABLE', (message: unknown) => {
      notice.notify({
        title: 'Up To Date',
        type: 'primary',
        message: message as string,
      })
    })

    window.api.ipc.on('mt::UPDATE_DOWNLOADED', (message: unknown) => {
      notice
        .notify({
          title: 'Update Ready',
          type: 'primary',
          message: message as string,
          showConfirm: true,
        })
        .then(() => {
          window.api.ipc.send('mt::INSTALL_UPDATE_NOW')
        })
        .catch(() => {})
    })

    window.api.ipc.on('mt::UPDATE_AVAILABLE', (message: unknown) => {
      notice.notify({
        title: 'Update Available',
        type: 'info',
        message: message as string,
      })
    })
  }

  return { listen }
})
