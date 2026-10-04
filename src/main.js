import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import '@fontsource-variable/bricolage-grotesque'
import '@fontsource/ibm-plex-sans/400.css'
import '@fontsource/ibm-plex-sans/500.css'
import '@fontsource/ibm-plex-sans/600.css'
import './assets/styles/main.css'

createApp(App).use(router).mount('#app')
