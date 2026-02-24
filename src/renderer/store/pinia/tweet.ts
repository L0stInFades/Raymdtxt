import { defineStore } from 'pinia'
import bus from '../../bus'

export const useTweetStore = defineStore('tweet', () => {
  function listen() {
    window.api.ipc.on('mt::tweet', (type: unknown) => {
      if (type === 'twitter') {
        bus.emit('tweetDialog')
      }
    })
  }

  return { listen }
})
