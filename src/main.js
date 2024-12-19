import { library } from '@fortawesome/fontawesome-svg-core';
import { faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';
import {
    faBan, faBorderAll,
    faCheck, faChevronRight, faCircleInfo, faCloud, faCloudSunRain, faComments,
    faFileExport,
    faGasPump, faHeadset, faImage, faJetFighter,
    faLink, faListCheck,
    faPenToSquare, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, faPrint,
    faQuestion, 
    faRoadCircleCheck, faRoute, faRotateLeft,
    faSave, faStarOfLife, faSun, faUser,
    faVideo, faWalkieTalkie, faXmark
} from '@fortawesome/free-solid-svg-icons';
import { createApp } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ConfirmationService from 'primevue/confirmationservice';
import PrimeView from 'primevue/config';
import ToastService from 'primevue/toastservice';
import 'primeicons/primeicons.css';
import 'primevue/resources/themes/saga-blue/theme.css';
import GoogleSignInPluggin from 'vue3-google-signin';
import App from './App.vue';
import router from './router';
import './style.css';

library.add( faBan, faBorderAll, 
    faCheck, faChevronRight, faCircleInfo, faCloud, faCloudSunRain, faComments, 
    faFacebookF, faFileExport, faGoogle, 
    faGasPump, faHeadset, faImage, faJetFighter, 
    faLink, faListCheck, 
    faPenToSquare, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, faPrint, 
    faQuestion, 
    faRoadCircleCheck, faRotateLeft, faRoute, 
    faSave, faStarOfLife, faSun, faUser,
    faVideo, faWalkieTalkie, faXmark)

createApp(App)
    .use(PrimeView)
    .use(ConfirmationService)
    .use(ToastService)
    .use(GoogleSignInPluggin, {clientId: '864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com'})
    .use(router)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')
