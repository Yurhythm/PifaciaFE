<template>
    <div v-if="show" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-lg" style="z-index: 1054;">
            <div class="modal-content">
                <form @submit.prevent="handleSubmit">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ form.id ? 'Edit Peserta' : 'Tambah Peserta' }}</h5>
                        <button type="button" class="btn-close" @click="$emit('close')"></button>
                    </div>
                    <div class="modal-body">
                        <!-- Pilih Event -->
                        <div class="mb-3">
                            <label>Event</label>
                            <select v-model="selectedEventId" class="form-select" required>
                                <option value="" disabled>Pilih Event</option>
                                <option v-for="event in events" :key="event.id" :value="event.id">
                                    {{ event.judul }}
                                </option>
                            </select>
                            <div v-if="errors.event_id" class="text-danger">{{ errors.event_id[0] }}</div>
                        </div>

                        <!-- Pilih Tiket -->
                        <div class="mb-3">
                            <label>Tiket</label>
                            <select v-model="form.tiket_id" class="form-select" required>
                                <option value="" disabled>Pilih Tiket</option>
                                <option v-for="tiket in tikets" :key="tiket.id" :value="tiket.id">
                                    {{ tiket.tipe }} - Rp{{ tiket.harga }}
                                </option>
                            </select>
                            <div v-if="errors.tiket_id" class="text-danger">{{ errors.tiket_id[0] }}</div>
                        </div>

                        <div class="mb-3">
                            <label>Nama</label>
                            <input v-model="form.nama" class="form-control" required />
                            <div v-if="errors.nama" class="text-danger">{{ errors.nama[0] }}</div>
                        </div>

                        <div class="mb-3">
                            <label>Email</label>
                            <input type="email" v-model="form.email" class="form-control" required />
                            <div v-if="errors.email" class="text-danger">{{ errors.email[0] }}</div>
                        </div>

                        <div class="mb-3">
                            <label>Daftar Pada</label>
                            <input type="datetime-local" v-model="form.daftar_pada" class="form-control" required />
                            <div v-if="errors.daftar_pada" class="text-danger">{{ errors.daftar_pada[0] }}</div>
                        </div>

                        <div class="form-check mb-3">
                            <input v-model="form.sudah_checkin" type="checkbox" class="form-check-input"
                                id="sudah_checkin" />
                            <label class="form-check-label" for="sudah_checkin">Sudah Check-in</label>
                            <div v-if="errors.sudah_checkin" class="text-danger">{{ errors.sudah_checkin[0] }}</div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Simpan</button>
                        <button type="button" class="btn btn-secondary" @click="$emit('close')">Batal</button>
                    </div>
                </form>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    </div>
</template>

<script setup>
import Swal from 'sweetalert2'
import { ref, reactive, onMounted, watch } from 'vue'
import api from '../../axios'
import { toRaw } from 'vue'

const props = defineProps(['show', 'peserta'])
const emit = defineEmits(['close', 'saved'])

const form = reactive({
    id: null,
    tiket_id: null,
    nama: '',
    email: '',
    daftar_pada: '',
    sudah_checkin: false,
})

const selectedEventId = ref('')
const tikets = ref([])
const events = ref([])
const errors = reactive({})

onMounted(async () => {
    try {
        const res = await api.get('/event-list')
        events.value = res.data
    } catch (err) {
        console.error('Gagal memuat event list', err)
    }
})

watch(selectedEventId, async (eventId) => {
    if (!eventId) return
    try {
        const res = await api.get(`/tiket-list/${eventId}`)
        tikets.value = res.data
    } catch (err) {
        console.error('Gagal memuat tiket list untuk event', err)
    }
})

watch(
    () => props.peserta,
    (val) => {
        if (val) {
            Object.assign(form, toRaw(val))
            selectedEventId.value = val.tiket?.event_id || ''
            if (val.daftar_pada) {
                const date = new Date(val.daftar_pada)
                form.daftar_pada = date.toISOString().slice(0, 16) // "2025-04-14T13:30"
            }
        } else {
            form.id = null
            form.tiket_id = null
            form.nama = ''
            form.email = ''
            form.daftar_pada = ''
            form.sudah_checkin = false
            selectedEventId.value = ''
            tikets.value = []
            Object.keys(errors).forEach(key => delete errors[key])
        }
    },
    { immediate: true }
)

const handleSubmit = async () => {
    try {
        if (form.id) {
            await api.put(`/peserta/${form.id}`, toRaw(form))

            await Swal.fire({
                title: 'Berhasil!',
                text: 'Data peserta berhasil diubah.',
                icon: 'success',
                confirmButtonText: 'Oke'
            })
        } else {
            await api.post('/peserta', toRaw(form))

            await Swal.fire({
                title: 'Berhasil!',
                text: 'Data peserta berhasil ditambah.',
                icon: 'success',
                confirmButtonText: 'Oke'
            })
        }
        emit('saved')
        emit('close')
    } catch (err) {
        if (err.response && err.response.status === 422) {
            Object.assign(errors, err.response.data.errors)
        } else {
            console.error(err)
        }
    }
}
</script>