import { library } from '@fortawesome/fontawesome-svg-core';
import { faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';
import {
    faBan, faBorderAll,
    faCheck, faCloudSunRain, faComments,
    faGasPump, faHeadset, faImage, faJetFighter,
    faListCheck,
    faPenToSquare, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture,
    faQuestion, 
    faRoadCircleCheck, faRoute, faRotateLeft,
    faStarOfLife, faSun,
    faVideo, faWalkieTalkie, faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import 'primeicons/primeicons.css';
import PrimeView from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import 'primevue/resources/themes/saga-blue/theme.css';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';
import GoogleSignInPluggin from 'vue3-google-signin';
import App from './App.vue';
import './style.css';

library.add( faBan, faBorderAll, 
    faCheck, faCloudSunRain, faComments, 
    faFacebookF, faGoogle, 
    faGasPump, faHeadset, faImage, faJetFighter, 
    faListCheck, 
    faPenToSquare, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, 
    faQuestion, 
    faRoadCircleCheck, faRotateLeft, faRoute, 
    faStarOfLife, faSun, 
    faVideo, faWalkieTalkie, faXmark)

createApp(App)
    .use(PrimeView)
    .use(ConfirmationService)
    .use(ToastService)
    .use(GoogleSignInPluggin, {clientId: '864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com'})
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')
