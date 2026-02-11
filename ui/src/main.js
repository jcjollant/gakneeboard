import { library } from '@fortawesome/fontawesome-svg-core';
import { faGoogle, faWordpress, faYoutube } from '@fortawesome/free-brands-svg-icons';
import {
    faArrowDown, faArrowsDownToLine, faArrowsUpToLine, faArrowUp,
    faBan, faBars, faBookOpen, faBorderAll, faBuilding,
    faCamera, faCheck, faChevronRight, faCircleInfo, faClock, faClone, faCloud, faCloudSunRain, faComments,
    faDisplay,
    faEject, faEllipsis, faExclamationCircle, faExclamationTriangle, faExternalLinkAlt, faEye,
    faFileExport, faFile, faFileCode,
    faFont, faBold,
    faGasPump, faGavel, faGear, faGripLines, faHeadset, faImage, faJetFighter,
    faLeftRight, faLink, faListCheck,
    faPenNib, faPenToSquare, faPhone, faPlane, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, faPlus, faPrint,
    faQuestion,
    faRoadCircleCheck,
    faRotateLeft,
    faRoute,
    faSave, faScroll, faScrewdriverWrench, faShield, faStarOfLife, faSun,
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
import { showSplash } from './consoleSplash';

library.add(
    faArrowDown, faArrowsDownToLine, faArrowsUpToLine, faArrowUp,
    faBan, faBars, faBookOpen, faBorderAll, faBuilding,
    faCamera, faCheck, faChevronRight, faCircleInfo, faClock, faClone, faCloud, faCloudSunRain, faComments,
    faDisplay,
    faEject, faEllipsis, faExclamationCircle, faExclamationTriangle, faExternalLinkAlt, faEye,
    faFileExport, faFile, faFileCode, faFont, faBold, faGoogle, faGripLines,
    faGasPump, faGavel, faGear, faHeadset, faImage, faJetFighter,
    faLeftRight, faLink, faListCheck,
    faPenNib, faPenToSquare, faPhone, faPlane, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, faPlus, faPrint,
    faQuestion,
    faRoadCircleCheck, faRotateLeft, faRoute,
    faSave, faScroll, faScrewdriverWrench, faShield, faStarOfLife, faSun,
    faTowerCell, faTowerObservation, faTrash, faTruckFast,
    faUser,
    faVideo, faWalkieTalkie, faWordpress, faXmark, faYoutube)
library.add(faFaceFrown, faFaceMeh, faFaceSmile)

import { AttributionService } from '@/services/AttributionService';

createApp(App)
    .use(PrimeView)
    .use(ConfirmationService)
    .use(ToastService)
    .use(router)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')

// Capture attribution data from window location immediately
AttributionService.initFromWindow()
showSplash()



if (process.env.NODE_ENV === 'production') {
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-M7NJWLEVMG');
}
