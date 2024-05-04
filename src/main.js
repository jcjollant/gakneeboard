import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeView from 'primevue/config';
import 'primeicons/primeicons.css'

createApp(App)
    .use(PrimeView)
    .mount('#app')
