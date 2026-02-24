import notice from '../services/notification'

const state = {}

const getters = {}

const mutations = {}

// mt::UPDATE_DOWNLOADED
const actions = {
  LISTEN_FOR_UPDATE({ commit }) {
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
        title: 'Update not Available',
        type: 'primary',
        message,
      })
    })
    window.api.ipc.on('mt::UPDATE_DOWNLOADED', (message) => {
      notice.notify({
        title: 'Update Downloaded',
        type: 'info',
        message,
      })
    })
    window.api.ipc.on('mt::UPDATE_AVAILABLE', (message) => {
      notice
        .notify({
          title: 'Update Available',
          type: 'primary',
          message,
          showConfirm: true,
        })
        .then(() => {
          const needUpdate = true
          window.api.ipc.send('mt::NEED_UPDATE', { needUpdate })
        })
        .catch(() => {
          const needUpdate = false
          window.api.ipc.send('mt::NEED_UPDATE', { needUpdate })
        })
    })
  },
}

export default { state, getters, mutations, actions }
