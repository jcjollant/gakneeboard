import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeView from 'primevue/config';
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import ConfirmationService from 'primevue/confirmationservice'

createApp(App)
    .use(PrimeView)
    .use(ConfirmationService)
    .mount('#app')
