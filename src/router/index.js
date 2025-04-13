import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../components/Landing.vue'
import Login from '../components/Login.vue'
import Dashboard from '../components/Dashboard.vue'
import Event from '../components/page_event/EventPage.vue'
import Tiket from '../components/page_tiket/TiketPage.vue'
import Peserta from '../components/page_peserta/PesertaPage.vue'
import User from '../components/page_user/UserPage.vue'
import Role from '../components/page_role/RolePage.vue'

const routes = [
    { path: '/', name: 'Landing', component: Landing },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { mustLogout: true }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/user',
        name: 'User',
        component: User,
        meta: { requiresAuth: true }
    },
    {
        path: '/role',
        name: 'Role',
        component: Role,
        meta: { requiresAuth: true }
    },
    {
        path: '/event',
        name: 'Event',
        component: Event,
        meta: { requiresAuth: true }
    },
    {
        path: '/tiket',
        name: 'Tiket',
        component: Tiket,
        meta: { requiresAuth: true }
    },
    {
        path: '/peserta',
        name: 'Peserta',
        component: Peserta,
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.requiresAuth && !token) {
        next('/login')
    } else {
        next()
    }
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    if (to.meta.mustLogout && token) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router