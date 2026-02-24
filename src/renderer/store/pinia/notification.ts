import { defineStore } from 'pinia'
import notice from '../../services/notification'

export const useNotificationStore = defineStore('notification', () => {
  function listen() {
    const DEFAULT_OPTS = {
      title: 'Infomation',
      type: 'primary',
      time: 10000,
      message: 'You should never see this message',
    }

    window.api.ipc.on('mt::show-notification', (opts: unknown) => {
      const options = Object.assign({}, DEFAULT_OPTS, opts as Record<string, unknown>)
      notice.notify(options)
    })

    window.api.ipc.on('mt::pandoc-not-exists', async (opts: unknown) => {
      const options = Object.assign({}, DEFAULT_OPTS, opts as Record<string, unknown>)
      ;(options as Record<string, unknown>).showConfirm = true
      await notice.notify(options)
      window.api.shell.openExternal('http://pandoc.org')
    })
  }

  return { listen }
})
