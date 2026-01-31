import { createRouter, createWebHistory } from 'vue-router';

import Home from '../views/Home.vue';
import TemplateViewer from '../views/TemplateViewer.vue';
import Print from '../views/Print.vue';
import FTUX from '../views/FTUX.vue';
import { affiliates } from '../lib/affiliates';

const Admin = () => import('../views/Admin.vue');
const PricingPlans = () => import('../views/PricingPlans.vue');
const ThankYou = () => import('../views/ThankYou.vue');
const FormatSelector = () => import('../components/templates/FormatSelector.vue');
const Demo = () => import('../views/Demo.vue');
const TileTest = () => import('../views/TileTest.vue');
const PageTest = () => import('../views/PageTest.vue');
const AffiliateRedirect = () => import('../views/AffiliateRedirect.vue');

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
