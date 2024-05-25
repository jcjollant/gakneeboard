import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeView from 'primevue/config';
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import GoogleSignInPluggin from 'vue3-google-signin';

createApp(App)
    .use(PrimeView)
    .use(ConfirmationService)
    .use(ToastService)
    .use(GoogleSignInPluggin, {clientId: '864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com'})
    .mount('#app')
