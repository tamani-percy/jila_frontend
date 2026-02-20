import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('@/views/HomeView.vue'),
        },
        {
            path: '/driver',
            name: 'driver',
            component: () => import('@/views/DriverView.vue'),
        },
        {
            path: '/rider',
            name: 'rider',
            component: () => import('@/views/RiderView.vue'),
        },
    ],
})

export default router
