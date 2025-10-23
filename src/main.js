import { library } from '@fortawesome/fontawesome-svg-core';
import { faFacebookF, faGoogle, faWordpress, faYoutube } from '@fortawesome/free-brands-svg-icons';
import {
    faArrowDown, faArrowUp,
    faBan, faBars, faBorderAll, faBuilding,
    faCamera, faCheck, faChevronRight, faCircleInfo, faClock, faClone, faCloud, faCloudSunRain, faComments,
    faDisplay,
    faEject, faExclamationTriangle,
    faFileExport, faFile,
    faGasPump, faGavel, faGear, faHeadset, faImage, faJetFighter,
    faLeftRight, faLink, faListCheck,
    faPenToSquare, faPhone, faPlane, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, faPrint,
    faQuestion,
    faRoadCircleCheck,
    faRotateLeft,
    faRoute,
    faSave, faScrewdriverWrench, faStarOfLife, faSun,
    faTowerCell, faTowerObservation, faTrash, faTruckFast,
    faUser,
    faVideo, faWalkieTalkie, faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { faFaceFrown, faFaceMeh, faFaceSmile } from '@fortawesome/free-regular-svg-icons';
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
    faCamera, faCheck, faChevronRight, faCircleInfo, faClock, faClone, faCloud, faCloudSunRain, faComments, 
    faDisplay,
    faEject, faExclamationTriangle,
    faFacebookF, faFileExport, faFile, faGoogle, 
    faGasPump, faGavel, faGear, faHeadset, faImage, faJetFighter, 
    faLeftRight, faLink, faListCheck, 
    faPenToSquare, faPhone, faPlane, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, faPrint, 
    faQuestion, 
    faRoadCircleCheck, faRotateLeft, faRoute, 
    faSave, faScrewdriverWrench, faStarOfLife, faSun, 
    faTowerCell, faTowerObservation, faTrash, faTruckFast,
    faUser,
    faVideo, faWalkieTalkie, faWordpress, faXmark, faYoutube)
library.add(faFaceFrown, faFaceMeh, faFaceSmile)

createApp(App)
    .use(PrimeView)
    .use(ConfirmationService)
    .use(ToastService)
    .use(router)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')

if(process.env.NODE_ENV === 'production') {
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-M7NJWLEVMG'); 
}
