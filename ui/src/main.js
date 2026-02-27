import { library } from '@fortawesome/fontawesome-svg-core';
import { faGoogle, faWordpress, faYoutube } from '@fortawesome/free-brands-svg-icons';
import {
    faArrowDown, faArrowsDownToLine, faArrowsUpToLine, faArrowUp,
    faBan, faBars, faBookOpen, faBorderAll, faBuilding,
    faCamera, faCheck, faCheckDouble, faChevronRight, faCircleInfo, faClock, faClone, faCloud, faCloudSunRain, faComments,
    faDisplay,
    faEject, faEllipsis, faExclamationCircle, faExclamationTriangle, faExternalLinkAlt, faEye,
    faFileExport, faFile, faFileCode,
    faFont, faBold,
    faGasPump, faGavel, faGear, faGripLines,
    faHeadset,
    faImage,
    faJetFighter,
    faLeftRight, faLink, faListCheck, faLock,
    faMountainSun,
    faNewspaper,
    faPalette, faPenNib, faPenToSquare, faPhone, faPlane, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, faPlus, faPrint,
    faQuestion,
    faRoadCircleCheck, faRotateLeft, faRotateRight, faRoute,
    faSave, faScroll, faScrewdriverWrench, faShield, faShoppingCart, faSpinner, faStarOfLife, faStore, faSuitcaseMedical, faSun,
    faTowerBroadcast, faTowerCell, faTowerObservation, faTrash, faTruckFast,
    faUser, faUsers,
    faVideo,
    faWalkieTalkie,
    faXmark,
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
    faCamera, faCheck, faCheckDouble, faChevronRight, faCircleInfo, faClock, faClone, faCloud, faCloudSunRain, faComments,
    faDisplay,
    faEject, faEllipsis, faExclamationCircle, faExclamationTriangle, faExternalLinkAlt, faEye,
    faFileExport, faFile, faFileCode, faFont, faBold, faGoogle, faGripLines,
    faGasPump, faGavel, faGear,
    faHeadset,
    faImage,
    faJetFighter,
    faLeftRight, faLink, faListCheck, faLock,
    faMountainSun,
    faNewspaper,
    faPalette, faPenNib, faPenToSquare, faPhone, faPlane, faPlaneArrival, faPlaneCircleCheck, faPlaneDeparture, faPlus, faPrint,
    faQuestion,
    faRoadCircleCheck, faRotateLeft, faRotateRight, faRoute,
    faSave, faScroll, faScrewdriverWrench, faShield, faShoppingCart, faSpinner, faStarOfLife, faStore, faSuitcaseMedical, faSun,
    faTowerBroadcast, faTowerCell, faTowerObservation, faTrash, faTruckFast,
    faUser, faUsers, faSpinner,
    faVideo, faWalkieTalkie, faWordpress,
    faXmark,
    faYoutube)
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



const gaTag = process.env.GOOGLE_ANALYTICS_TAG;

if (gaTag && gaTag !== '%GOOGLE_ANALYTICS_TAG%') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());

    if (import.meta.env.PROD) {
        window.gtag('config', gaTag);
    } else {
        // In dev, you can still call config with debug mode or just let events queue in dataLayer
        // The GA Debugger extension will also pick these up
        window.gtag('config', gaTag, { 'debug_mode': true });
    }
}
