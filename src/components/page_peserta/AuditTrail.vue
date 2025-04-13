<template>
    <div>
        <h5 class="mb-4 mt-5">History</h5>

        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Waktu</th>
                    <th>Pengguna</th>
                    <th>Aksi</th>
                    <th>Deskripsi</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="trail in auditTrails.data" :key="trail.id">
                    <td>{{ formatDate(trail.created_at) }}</td>
                    <td>{{ trail.user?.name || '-' }}</td>
                    <td>{{ trail.action }}</td>
                    <td>{{ trail.description }}</td>
                </tr>
            </tbody>
        </table>

        <p v-if="!loading && auditTrails.data?.length === 0" class="text-muted">Tidak ada data audit.</p>

        <nav>
            <ul class="pagination">
                <li class="page-item" :class="{ disabled: !auditTrails.prev_page_url }">
                    <button class="page-link" @click="fetchAuditTrails(auditTrails.prev_page_url)">Prev</button>
                </li>
                <li class="page-item" :class="{ disabled: !auditTrails.next_page_url }">
                    <button class="page-link" @click="fetchAuditTrails(auditTrails.next_page_url)">Next</button>
                </li>
            </ul>
        </nav>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../axios'

const auditTrails = ref({ data: [] })
const loading = ref(false)

const fetchAuditTrails = async (url = null) => {
    loading.value = true
    try {
        const res = await api.get(url || '/audit-trails', {
            params: { menu: 'peserta' }
        })
        auditTrails.value = res.data
    } catch (err) {
        console.error('Gagal mengambil audit trails:', err)
    } finally {
        loading.value = false
    }
}

const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })
}

onMounted(() => {
    fetchAuditTrails()
})
</script>