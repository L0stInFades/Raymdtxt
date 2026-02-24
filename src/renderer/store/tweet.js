import bus from '../bus'

const state = {}

const getters = {}

const mutations = {}

const actions = {
  LISTEN_FOR_TWEET() {
    window.api.ipc.on('mt::tweet', (type) => {
      if (type === 'twitter') {
        bus.$emit('tweetDialog')
      }
    })
  },
}

export default { state, getters, mutations, actions }
