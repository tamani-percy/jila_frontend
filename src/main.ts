import './assets/main.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'
import ui from '@nuxt/ui/vue-plugin'
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { autoAnimatePlugin } from '@formkit/auto-animate/vue'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(ui)
app.use(autoAnimatePlugin)
app.mount('#app')
