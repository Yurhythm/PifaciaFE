<template>
    <div v-if="show" class="modal fade show d-block" tabindex="-1">
        <div class="modal-dialog modal-lg" style="z-index: 1054;">
            <div class="modal-content">
                <form @submit.prevent="handleSubmit">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ form.id ? 'Edit Event' : 'Tambah Event' }}</h5>
                        <button type="button" class="btn-close" @click="$emit('close')"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label>Judul</label>
                            <input v-model="form.judul" class="form-control" required />
                            <div v-if="errors.judul" style="color:red;">
                                {{ errors.judul[0] }}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label>Mulai</label>
                            <input type="date" v-model="form.mulai_pada" class="form-control" required />
                            <div v-if="errors.mulai_pada" style="color:red;">
                                {{ errors.mulai_pada[0] }}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label>Selesai</label>
                            <input type="date" v-model="form.selesai_pada" class="form-control" required />
                            <div v-if="errors.selesai_pada" style="color:red;">
                                {{ errors.selesai_pada[0] }}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label>Brosur PDF</label>
                            <input type="file" @change="handleFile" class="form-control" />
                            <div v-if="errors.brosur_pdf" style="color:red;">
                                {{ errors.brosur_pdf[0] }}
                            </div>
                        </div>
                        <div class="mb-3">
                            <label>Lokasi</label>
                            <input v-model="form.metadata.lokasi" class="form-control" />
                        </div>
                        <div class="mb-3">
                            <label>Sponsor</label>
                            <input v-model="form.metadata.sponsor" class="form-control" />
                        </div>
                        <div class="mb-3">
                            <label>Pembawa Acara</label>
                            <input v-model="form.metadata.pembawa_acara" class="form-control" />
                        </div>
                        <div v-if="errors.metadata" style="color:red;">
                            {{ errors.metadata[0] }}
                        </div>
                        <div class="form-check mb-3">
                            <input v-model="form.daring" class="form-check-input" type="checkbox" id="daring" />
                            <label class="form-check-label" for="daring">Daring</label>
                            <div v-if="errors.daring" style="color:red;">
                                {{ errors.daring[0] }}
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
import Swal from 'sweetalert2'
import { reactive, watch } from 'vue'
import api from '../../axios'
import { toRaw } from 'vue'

const props = defineProps(['show', 'event'])
const emit = defineEmits(['close', 'saved'])
const errors = reactive({})

const form = reactive({
    id: null,
    judul: '',
    mulai_pada: '',
    selesai_pada: '',
    daring: false,
    brosur_pdf: null,
    metadata: {
        lokasi: '',
        sponsor: '',
        pembawa_acara: '',
    }
})

watch(
    () => props.event,
    (val) => {
        if (val) {
            Object.assign(form, toRaw(val))
            if (form.mulai_pada) form.mulai_pada = formatTanggal(form.mulai_pada)
            if (form.selesai_pada) form.selesai_pada = formatTanggal(form.selesai_pada)
            if (!val.metadata || typeof val.metadata !== 'object') {
                form.metadata = {
                    lokasi: '',
                    sponsor: '',
                    pembawa_acara: '',
                }
            } else {
                form.metadata = {
                    lokasi: val.metadata.lokasi || '',
                    sponsor: val.metadata.sponsor || '',
                    pembawa_acara: val.metadata.pembawa_acara || '',
                }
            }
        } else {
            form.id = null
            form.judul = ''
            form.mulai_pada = ''
            form.selesai_pada = ''
            form.daring = 0
            form.brosur_pdf = null
            form.metadata = {
                lokasi: '',
                sponsor: '',
                pembawa_acara: '',
            }
            Object.keys(errors).forEach(key => delete errors[key])
        }
    },
    { immediate: true }
)

const handleFile = (e) => {
    form.brosur_pdf = e.target.files[0]
}

const handleSubmit = async () => {
    const formData = new FormData()
    formData.append('judul', form.judul)
    formData.append('mulai_pada', form.mulai_pada)
    formData.append('selesai_pada', form.selesai_pada)
    formData.append('daring', form.daring ? 1 : 0)
    formData.append('metadata[lokasi]', form.metadata.lokasi)
    formData.append('metadata[sponsor]', form.metadata.sponsor)
    formData.append('metadata[pembawa_acara]', form.metadata.pembawa_acara)
    if (form.brosur_pdf) formData.append('brosur_pdf', form.brosur_pdf)

    try {
        if (form.id) {
            await api.post(`/event/${form.id}?_method=PUT`, formData)

            await Swal.fire({
                title: 'Berhasil!',
                text: 'Data event berhasil diubah.',
                icon: 'success',
                confirmButtonText: 'Oke'
            })
        } else {
            await api.post('/event', formData)

            await Swal.fire({
                title: 'Berhasil!',
                text: 'Data event berhasil ditambah.',
                icon: 'success',
                confirmButtonText: 'Oke'
            })
        }



        emit('saved')
        emit('close')
    } catch (err) {
        if (err.response && err.response.status === 422) {
            Object.assign(errors, err.response.data.errors)
            console.log(errors.brosur_pdf[0]);

        } else {
            console.error(err)
        }
    }
}


const formatTanggal = (tanggal) => {
    const date = new Date(tanggal)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0') // karena bulan mulai dari 0
    const year = date.getFullYear()

    return `${year}-${month}-${day}`
}

</script>