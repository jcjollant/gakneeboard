import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeView from 'primevue/config';
import 'primeicons/primeicons.css'
import 'primevue/resources/themes/saga-blue/theme.css'
import ConfirmationService from 'primevue/confirmationservice'
import ToastService from 'primevue/toastservice'
import GoogleSignInPluggin from 'vue3-google-signin'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlaneDeparture, faCloudSunRain, faListCheck, faPlaneCircleCheck, faGasPump,
    faRoute, faPenToSquare, faHeadset, faSun, faBorderAll,
    faImage, faVideo, faQuestion} from '@fortawesome/free-solid-svg-icons'
import { faGoogle, faFacebookF } from '@fortawesome/free-brands-svg-icons'

library.add(faPlaneDeparture, faCloudSunRain, faListCheck, faPlaneCircleCheck, faGasPump,
    faRoute, faPenToSquare, faHeadset, faSun, faBorderAll, faImage, faGoogle, faFacebookF,
    faVideo, faQuestion)

createApp(App)
    .use(PrimeView)
    .use(ConfirmationService)
    .use(ToastService)
    .use(GoogleSignInPluggin, {clientId: '864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com'})
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')
