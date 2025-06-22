import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import PricingPlans from '../views/PricingPlans.vue';
import Print from '../views/Print.vue';
import TemplateViewer from '../views/TemplateViewer.vue';
import ThankYou from '../views/ThankYou.vue';
import FTUX from '../views/FTUX.vue';
import FormatSelector from '../components/templates/FormatSelector.vue';

export const RouterNames = {
    Home: 'Home',
    Plans: 'Plans',
    ThankYou: 'Thank you',
    Print: 'Print',
    Template: 'Template',
    FTUX: 'First Time',
    FormatSelector: 'Format Selector',
}

const routes = [
    { path: '/', name: RouterNames.Home, component: Home },
    { path: '/plans', name: RouterNames.Plans, component: PricingPlans },
    { path: '/thankyou', name: RouterNames.ThankYou, component: ThankYou },
    { path: '/print/:id', name: RouterNames.Print, component: Print },
    { path: '/ftux', name: RouterNames.FTUX, component: FTUX},
    { path: '/template/:id', name: RouterNames.Template, component: TemplateViewer },
    { path: '/format-selector', name: RouterNames.FormatSelector, component: FormatSelector },
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
