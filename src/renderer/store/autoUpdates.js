import notice from '../services/notification'

const state = {}

const getters = {}

const mutations = {}

// mt::UPDATE_DOWNLOADED
const actions = {
  LISTEN_FOR_UPDATE() {
    window.api.ipc.on('mt::UPDATE_ERROR', (message) => {
      notice.notify({
        title: 'Update',
        type: 'error',
        time: 10000,
        message,
      })
    })
    window.api.ipc.on('mt::UPDATE_NOT_AVAILABLE', (message) => {
      notice.notify({
        title: 'Up To Date',
        type: 'primary',
        message,
      })
    })
    window.api.ipc.on('mt::UPDATE_DOWNLOADED', (message) => {
      notice
        .notify({
          title: 'Update Ready',
          type: 'primary',
          message,
          showConfirm: true,
        })
        .then(() => {
          window.api.ipc.send('mt::INSTALL_UPDATE_NOW')
        })
        .catch(() => {})
    })
    window.api.ipc.on('mt::UPDATE_AVAILABLE', (message) => {
      notice.notify({
        title: 'Update Available',
        type: 'info',
        message,
      })
    })
  },
}

export default { state, getters, mutations, actions }
