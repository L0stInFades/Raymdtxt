import { createApp } from 'vue'
import { createPinia } from 'pinia'
import bootstrapRenderer from './bootstrap'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import axios from './axios'
import store from './store'
import './assets/symbolIcon'
import services from './services'
import routes from './router'
import { addElementStyle } from '@/util/theme'

import './assets/styles/index.css'
import './assets/styles/printService.css'

import RootApp from './RootApp.vue'

// -----------------------------------------------

bootstrapRenderer()

addElementStyle()

// -----------------------------------------------
// Be careful when changing code before this line!

const router = routes(window.marktext.env.type)

const app = createApp(RootApp)

app.use(createPinia())
app.use(store)
app.use(router)
app.use(ElementPlus)

app.config.globalProperties.$http = axios

services.forEach((s) => {
  app.config.globalProperties[`$${s.name}`] = s[s.name]
})

app.mount('#app')
