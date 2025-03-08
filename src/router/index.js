import { createRouter, createWebHistory } from 'vue-router';
import Template from '../views/Template.vue';
import Home from '../views/Home.vue';
import PricingPlans from '../views/PricingPlans.vue';
import Print from '../views/Print.vue';
import ThankYou from '../views/ThankYou.vue';

export const RouterNames = {
    Home: 'Home',
    Plans: 'Plans',
    ThankYou: 'Thank you',
    Print: 'Print',
    Template: 'Template'
}

const routes = [
    { path: '/', name: RouterNames.Home, component: Home },
    { path: '/plans', name: RouterNames.Plans, component: PricingPlans },
    { path: '/thankyou', name: RouterNames.ThankYou, component: ThankYou },
    { path: '/print/:id', name: RouterNames.Print, component: Print },
    { path: '/template/:id', name: RouterNames.Template, component: Template }
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
