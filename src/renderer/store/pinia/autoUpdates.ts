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
        title: 'Update not Available',
        type: 'primary',
        message: message as string,
      })
    })

    window.api.ipc.on('mt::UPDATE_DOWNLOADED', (message: unknown) => {
      notice.notify({
        title: 'Update Downloaded',
        type: 'info',
        message: message as string,
      })
    })

    window.api.ipc.on('mt::UPDATE_AVAILABLE', (message: unknown) => {
      const msg = message as string
      notice
        .notify({
          title: 'Update Available',
          type: 'primary',
          message: msg,
          showConfirm: true,
        })
        .then(() => {
          window.api.ipc.send('mt::NEED_UPDATE', { needUpdate: true })
        })
        .catch(() => {
          window.api.ipc.send('mt::NEED_UPDATE', { needUpdate: false })
        })
    })
  }

  return { listen }
})
