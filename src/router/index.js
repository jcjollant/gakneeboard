import { createRouter, createWebHistory } from 'vue-router';
import Template from '../views/Template.vue';
import Home from '../views/Home.vue';

const routes = [
    { path: '/', name: 'Home', component: Home },
    { path: '/template/', name: 'Template', component: Template }
]


const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
