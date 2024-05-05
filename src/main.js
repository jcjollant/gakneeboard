import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeView from 'primevue/config';
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/saga-blue/theme.css'

createApp(App)
    .use(PrimeView)
    .mount('#app')
