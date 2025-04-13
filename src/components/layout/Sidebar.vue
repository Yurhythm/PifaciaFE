<template>
    <div class="d-flex flex-column justify-between bg-light vh-100 p-3 border-end" style="width: 240px;">
        <div>
            <ul class="nav flex-column">
                <li class="nav-item mb-2">
                    <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
                </li>
                <li v-if="permissions.includes('event')" class="nav-item mb-2">
                    <router-link to="/event" class="nav-link">Event</router-link>
                </li>
                <li v-if="permissions.includes('tiket')" class="nav-item mb-2">
                    <router-link to="/tiket" class="nav-link">Tiket</router-link>
                </li>
                <li v-if="permissions.includes('peserta')" class="nav-item mb-2">
                    <router-link to="/peserta" class="nav-link">Peserta</router-link>
                </li>
                <li v-if="permissions.includes('user')" class="nav-item mb-2">
                    <router-link to="/user" class="nav-link">Manajemen User</router-link>
                </li>
                <li v-if="permissions.includes('role')" class="nav-item mb-2">
                    <router-link to="/role" class="nav-link">Manajemen Role</router-link>
                </li>
            </ul>
        </div>

        <div class="border-top pt-3 mt-3">
            <button @click="logout" class="btn btn-outline-danger w-100">Logout</button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import api from '../../axios'

const permissions = JSON.parse(localStorage.getItem('permissions'))

const router = useRouter()

const logout = async () => {
    try {
        await api.post('/logout')
    } catch (error) {
        console.error('Logout failed:', error)
    }

    localStorage.removeItem('token')
    router.push('/login')
}
</script>

<style scoped>
.router-link-active {
    font-weight: bold;
    color: #0d6efd !important;
}
</style>