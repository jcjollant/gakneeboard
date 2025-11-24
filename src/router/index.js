import { createRouter, createWebHistory } from 'vue-router';

import Admin from '../views/Admin.vue';
import Home from '../views/Home.vue';
import PricingPlans from '../views/PricingPlans.vue';
import Print from '../views/Print.vue';
import TemplateViewer from '../views/TemplateViewer.vue';
import ThankYou from '../views/ThankYou.vue';
import FTUX from '../views/FTUX.vue';
import FormatSelector from '../components/templates/FormatSelector.vue';
import Demo from '../views/Demo.vue';
import TileTest from '../views/TileTest.vue';

export const RouterNames = {
    Admin: 'Admin',
    Home: 'Home',
    Plans: 'Plans',
    ThankYou: 'Thank you',
    Print: 'Print',
    Template: 'Template',
    FTUX: 'First Time',
    FormatSelector: 'Format Selector',
    Demo: 'Demo',
    TileTest: 'Tile Test',
}

const routes = [
    { path: '/', name: RouterNames.Home, component: Home },
    { path: '/yt', redirect: '/?utm_source=youtube' },
    { path: '/fb', redirect: '/?utm_source=facebook' },
    { path: '/ig', redirect: '/?utm_source=instagram' },
    { path: '/admin', name: RouterNames.Admin, component: Admin },
    { path: '/plans', name: RouterNames.Plans, component: PricingPlans },
    { path: '/thankyou', name: RouterNames.ThankYou, component: ThankYou },
    { path: '/print/:id', name: RouterNames.Print, component: Print },
    { path: '/ftux', name: RouterNames.FTUX, component: FTUX},
    { path: '/template/:id', name: RouterNames.Template, component: TemplateViewer },
    { path: '/format-selector', name: RouterNames.FormatSelector, component: FormatSelector },
    { path: '/demo/:name', name: RouterNames.Demo, component: Demo },
    { path: '/test/tile', name: RouterNames.TileTest, component: TileTest },

]


const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
