import { createRouter, createWebHistory } from 'vue-router';
import Template from '../views/Template.vue';
import Home from '../views/Home.vue';
import PricingPlans from '../views/PricingPlans.vue';
import Print from '../views/Print.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/plans', name: 'Plans', component: PricingPlans },
    { path: '/print', name: 'Print', component: Print },
    { path: '/template/:id', name: 'Template', component: Template }
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
