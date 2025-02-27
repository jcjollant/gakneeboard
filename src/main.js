import { library } from '@fortawesome/fontawesome-svg-core';
import { faFacebookF, faGoogle } from '@fortawesome/free-brands-svg-icons';
import {
    faArrowDown, faArrowUp,
    faBan, faBars, faBorderAll, faBuilding,
    faCamera, faCheck, faChevronRight, faCircleInfo, faCloud, faCloudSunRain, faComments,
    faDisplay,
    faEject,
    faFileExport,
    faGasPump, faGear, faHeadset, faImage, faJetFighter,
    faLink, faListCheck,
    faPenToSquare, faPlane, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, faPrint,
    faQuestion,
    faRoadCircleCheck,
    faRotateLeft,
    faRoute,
    faSave, faScrewdriverWrench, faStarOfLife, faSun,
    faTowerCell, faTowerObservation, faTrash, faTruckFast,
    faUser,
    faVideo, faWalkieTalkie, faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import 'primeicons/primeicons.css';
import PrimeView from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import 'primevue/resources/themes/saga-blue/theme.css';
import ToastService from 'primevue/toastservice';
import { createApp } from 'vue';
import App from '@/App.vue';
import router from './router';
import './style.css';

library.add( 
    faArrowDown, faArrowUp,
    faBan, faBars, faBorderAll, faBuilding,
    faCamera, faCheck, faChevronRight, faCircleInfo, faCloud, faCloudSunRain, faComments, 
    faDisplay,
    faEject,
    faFacebookF, faFileExport, faGoogle, 
    faGasPump, faGear, faHeadset, faImage, faJetFighter, 
    faLink, faListCheck, 
    faPenToSquare, faPlane, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, faPrint, 
    faQuestion, 
    faRoadCircleCheck, faRotateLeft, faRoute, 
    faSave, faScrewdriverWrench, faStarOfLife, faSun, 
    faTowerCell, faTowerObservation, faTrash, faTruckFast,
    faUser,
    faVideo, faWalkieTalkie, faXmark)

createApp(App)
    .use(PrimeView)
    .use(ConfirmationService)
    .use(ToastService)
    // .use(GoogleSignInPluggin, {clientId: '864395393673-li5elss3gtbhipp6pdjs1pbgbl0866si.apps.googleusercontent.com'})
    .use(router)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')
