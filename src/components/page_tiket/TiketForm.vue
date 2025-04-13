<template>
    <div v-if="show" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-lg" style="z-index: 1054;">
            <div class="modal-content">
                <form @submit.prevent="handleSubmit">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ form.id ? 'Edit Tiket' : 'Tambah Tiket' }}</h5>
                        <button type="button" class="btn-close" @click="$emit('close')"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label>Event</label>
                            <select v-model="form.event_id" class="form-select" required>
                                <option value="" disabled>Pilih Event</option>
                                <option v-for="event in events" :key="event.id" :value="event.id">
                                    {{ event.judul }}
                                </option>
                            </select>
                            <div v-if="errors.event_id" style="color:red;">
                                {{ errors.event_id[0] }}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label>Tipe Tiket</label>
                            <input v-model="form.tipe" class="form-control" required />
                            <div v-if="errors.tipe" style="color:red;">
                                {{ errors.tipe[0] }}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label>Harga</label>
                            <input type="number" v-model="form.harga" class="form-control" required />
                            <div v-if="errors.harga" style="color:red;">
                                {{ errors.harga[0] }}
                            </div>
                        </div>
                        <div class="form-check mb-3">
                            <input v-model="form.tersedia" class="form-check-input" type="checkbox" id="tersedia" />
                            <label class="form-check-label" for="tersedia">Tersedia</label>
                            <div v-if="errors.tersedia" style="color:red;">
                                {{ errors.tersedia[0] }}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label>Fitur (Pisahkan dengan koma)</label>
                            <input v-model="fiturInput" class="form-control"
                                placeholder="Contoh: VIP, Snack, Sertifikat" />
                            <div v-if="errors.fitur" style="color:red;">
                                {{ errors.fitur[0] }}
                            </div>
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
import { reactive, watch, ref } from 'vue'
import api from '../../axios'
import { toRaw } from 'vue'

const props = defineProps(['show', 'tiket']) 
const emit = defineEmits(['close', 'saved'])

const errors = reactive({})
const fiturInput = ref('')

const form = reactive({
    id: null,
    event_id: null,
    tipe: '',
    harga: 0,
    tersedia: true,
    fitur: []
})

watch(
    () => props.tiket,
    (val) => {
        if (val) {
            Object.assign(form, toRaw(val))
            if (Array.isArray(val.fitur)) {
                fiturInput.value = val.fitur.join(', ')
            } else {
                fiturInput.value = ''
            }

        } else {
            form.id = null
            form.event_id = null
            form.tipe = ''
            form.harga = 0
            form.tersedia = true
            form.fitur = []
            fiturInput.value = ''
            Object.keys(errors).forEach(key => delete errors[key])
        }
    },
    { immediate: true }
)


const handleSubmit = async () => {
    Object.assign(form, { fitur: fiturInput.value.split(',').map(f => f.trim()).filter(f => f) })

    try {
        if (form.id) {
            await api.put(`/tiket/${form.id}`, toRaw(form))
        } else {
            await api.post('/tiket', toRaw(form))
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

import { onMounted } from 'vue'

const events = ref([])

onMounted(async () => {
    try {
        const res = await api.get('/event-list')
        events.value = res.data
    } catch (error) {
        console.error('Gagal memuat event list', error)
    }
})
</script>