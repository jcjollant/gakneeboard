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
import PageTest from '../views/PageTest.vue';
import AffiliateRedirect from '../views/AffiliateRedirect.vue';
import { affiliates } from '../lib/affiliates';


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
    PageTest: 'Page Test',
}

const routes = [
    { path: '/', name: RouterNames.Home, component: Home },
    // redirect route to FTUX with youtube utm parameters
    { path: '/y', redirect: { name: RouterNames.FTUX, query: { utm_source: 'youtube', utm_medium: 'comment', utm_campaign: 'weekly' } } },
    { path: '/i', redirect: { name: RouterNames.FTUX, query: { utm_source: 'instagran', utm_medium: 'comment', utm_campaign: 'weekly' } } },
    { path: '/f', redirect: { name: RouterNames.FTUX, query: { utm_source: 'facebook', utm_medium: 'comment', utm_campaign: 'weekly' } } },
    { path: '/admin', name: RouterNames.Admin, component: Admin },
    { path: '/plans', name: RouterNames.Plans, component: PricingPlans },
    { path: '/thankyou', name: RouterNames.ThankYou, component: ThankYou },
    { path: '/print/:id', name: RouterNames.Print, component: Print },
    { path: '/ftux', name: RouterNames.FTUX, component: FTUX },
    { path: '/template/:id', name: RouterNames.Template, component: TemplateViewer },
    { path: '/format-selector', name: RouterNames.FormatSelector, component: FormatSelector },
    { path: '/demo/:name', name: RouterNames.Demo, component: Demo },
    { path: '/test/tile', name: RouterNames.TileTest, component: TileTest },
    { path: '/test/page', name: RouterNames.PageTest, component: PageTest },
    {
        path: '/cfi',
        component: {
            template: '<div>Redirecting...</div>',
            mounted() {
                window.location.href = '/cfi-ambassadors.html';
            }
        }
    },
    ...Object.keys(affiliates).map(path => ({ path: '/' + path, component: AffiliateRedirect }))
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
