<template>
    <div class="d-flex flex-column justify-between bg-light vh-100 p-3 border-end" style="width: 240px;">
        <div>
            <ul class="nav flex-column">
                <li class="nav-item mb-2">
                    <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
                </li>
                <li class="nav-item mb-2">
                    <router-link to="/event" class="nav-link">Event</router-link>
                </li>
                <!-- Tambah menu lainnya di sini -->
            </ul>
        </div>

        <!-- Garis pemisah -->
        <div class="border-top pt-3 mt-3">
            <button @click="logout" class="btn btn-outline-danger w-100">Logout</button>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const logout = async () => {
    try {
        await axios.post('/api/logout', {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
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