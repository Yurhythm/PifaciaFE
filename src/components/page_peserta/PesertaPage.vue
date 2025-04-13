<template>
  <Layout>

    <div>
      <h2 class="mb-4">Peserta</h2>

      <div class="d-flex justify-content-between mb-3">
        <input v-model="search" @input="fetchpesertas()" class="form-control w-25" placeholder="Cari peserta..." />
        <div>
          <div class="d-inline-block me-2 position-relative">
            <input type="file" ref="importInput" @change="importFile" class="d-none" />
            <button class="btn btn-outline-primary" @click="triggerImport" :disabled="isImporting">
              <span v-if="isImporting" class="spinner-border spinner-border-sm me-2"></span>
              Import
            </button>
          </div>
          <button class="btn btn-outline-success me-2" @click="showExportModal = true" :disabled="isExporting">
            <span v-if="isExporting" class="spinner-border spinner-border-sm me-1"></span>
            Export
          </button>
          <button class="btn btn-primary" @click="openCreateModal">Tambah Peserta</button>
        </div>
      </div>

      <table class="table table-bordered">
        <thead>
          <tr>
            <th @click="sort('nama')" style="cursor: pointer">Nama</th>
            <th @click="sort('judul')" style="cursor: pointer">Event</th>
            <th @click="sort('tipe')" style="cursor: pointer">Tipe Tiket</th>
            <th @click="sort('email')" style="cursor: pointer">Email</th>
            <th @click="sort('sudah_checkin')" style="cursor: pointer">Check-In</th>
            <th @click="sort('daftar_pada')" style="cursor: pointer">Tanggal Daftar</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="peserta in pesertas.data" :key="peserta.id">
            <td>{{ peserta.nama }}</td>
            <td>{{ peserta.judul }}</td>
            <td>{{ peserta.tipe }}</td>
            <td>{{ peserta.email }}</td>
            <td>{{ peserta.sudah_checkin ? 'Ya' : 'Tidak' }}</td>
            <td>{{ formatTanggal(peserta.daftar_pada) }}</td>
            <td>
              <button class="btn btn-sm btn-warning me-1" @click="editpeserta(peserta)">Edit</button>
              <button class="btn btn-sm btn-danger" @click="deletepeserta(peserta.id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>

      <nav>
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: !pesertas.prev_page_url }">
            <button class="page-link" @click="fetchpesertas(pesertas.prev_page_url)">Prev</button>
          </li>
          <li class="page-item" :class="{ disabled: !pesertas.next_page_url }">
            <button class="page-link" @click="fetchpesertas(pesertas.next_page_url)">Next</button>
          </li>
        </ul>
      </nav>

      <hr>

      <pesertaForm :show="showForm" :peserta="selectedpeserta" @close="closeForm" @saved="fetchpesertas" />
    </div>
    <AuditTrail />
  </Layout>

  <div v-if="showExportModal" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog" style="z-index: 1054;">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Pilih Field Export</h5>
          <button type="button" class="btn-close" @click="showExportModal = false"></button>
        </div>
        <div class="modal-body">
          <div v-for="field in availableFields" :key="field" class="form-check">
            <input class="form-check-input" type="checkbox" :id="field" :value="field" v-model="selectedFields" />
            <label class="form-check-label" :for="field">
              {{ field }}
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showExportModal = false">Batal</button>
          <button class="btn btn-primary" :disabled="selectedFields.length === 0 || isExporting"
            @click="exportData(); showExportModal = false">
            <span v-if="isExporting" class="spinner-border spinner-border-sm me-1"></span>
            Export
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </div>

</template>

<script setup>
import Swal from 'sweetalert2'
import Layout from '../layout/Layout.vue'
import { ref, onMounted } from 'vue'
import api from '../../axios'
import pesertaForm from '../page_peserta/PesertaForm.vue'
import AuditTrail from '../page_peserta/AuditTrail.vue'

const pesertas = ref({})
const search = ref('')
const sortBy = ref('judul')
const sortDir = ref('asc')
const showForm = ref(false)
const selectedpeserta = ref(null)

const fetchpesertas = async (url = null) => {
  const params = {
    search: search.value,
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
  }

  const res = await api.get(url || '/peserta', { params })
  pesertas.value = res.data
}

const sort = (field) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'asc'
  }
  fetchpesertas()
}

const deletepeserta = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus peserta ini?',
    text: 'Tindakan ini tidak bisa dibatalkan!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/peserta/${id}`)
      await Swal.fire({
        title: 'Berhasil!',
        text: 'Peserta berhasil dihapus.',
        icon: 'success',
        confirmButtonText: 'Oke'
      })
      fetchpesertas()
    } catch (error) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menghapus peserta.',
        icon: 'error',
        confirmButtonText: 'Tutup'
      })
    }
  }
}


const importInput = ref(null)
const triggerImport = () => {
  importInput.value?.click()
}

const isImporting = ref(false)
let importIntervalId = null

const importFile = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  isImporting.value = true

  try {
    const res = await api.post('/peserta/import', formData)
    const jobId = res.data.job_id

    localStorage.setItem('import_job_id', jobId)
    checkImportStatus(jobId)
  } catch (error) {
    alert('Terjadi kesalahan saat mengunggah file.')
    isImporting.value = false
  }
}

const checkImportStatus = (jobId) => {
  if (importIntervalId) clearInterval(importIntervalId)

  isImporting.value = true
  importIntervalId = setInterval(async () => {
    try {
      const res = await api.get(`/check-queue-status/${jobId}`)
      const status = res.data.status
      console.log('Import status:', status)

      if (status === 'success') {
        clearInterval(importIntervalId)
        isImporting.value = false
        localStorage.removeItem('import_job_id')
        // alert('Data berhasil diimport.')
        Swal.fire({
          title: 'Berhasil!',
          text: 'Data berhasil diimport.',
          icon: 'success',
          confirmButtonText: 'Oke'
        })
        fetchpesertas()
      }

      if (status === 'failed') {
        clearInterval(importIntervalId)
        isImporting.value = false
        localStorage.removeItem('import_job_id')
        alert('Import gagal.')
      }
    } catch (err) {
      console.error('Gagal cek status import:', err)
      isImporting.value = false
    }
  }, 3000)
}


const showExportModal = ref(false)
const selectedFields = ref(['event_judul'])
const availableFields = [
  'event_judul',
  'tipe_tiket',
  'nama',
  'email',
  'sudah_checkin',
  'daftar_pada',
]

const isExporting = ref(false)

const exportData = async () => {
  try {
    isExporting.value = true
    const res = await api.post('/peserta/export', {
      fields: selectedFields.value,
    })
    // alert(`Export sedang dijalankan, mohon tunggu sampai file terdownload`)

    const jobId = res.data.job_id
    localStorage.setItem('export_job_id', jobId)
    checkExportStatus(jobId)
  } catch (error) {
    console.error('Export failed:', error)
    isExporting.value = false
  }
}

let intervalId = null

const checkExportStatus = (jobId) => {
  isExporting.value = true
  if (intervalId) clearInterval(intervalId)

  intervalId = setInterval(async () => {
    try {
      const res = await api.get(`/check-queue-status/${jobId}`)
      const status = res.data.status
      console.log('Status:', status)

      if (status === 'success' && res.data.attachment_url) {
        clearInterval(intervalId)
        downloadFile(res.data.attachment_url)
        localStorage.removeItem('export_job_id')
        isExporting.value = false
      }

      if (status === 'failed') {
        clearInterval(intervalId)
        alert('Export gagal.')
        localStorage.removeItem('export_job_id')
        isExporting.value = false
      }
    } catch (error) {
      console.error('Error checking status:', error)
      isExporting.value = false
    }
  }, 3000)
}

const downloadFile = (url) => {
  const a = document.createElement('a')
  a.href = url
  a.download = ''
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

const openCreateModal = () => {
  selectedpeserta.value = null
  showForm.value = true
}

const editpeserta = (peserta) => {
  selectedpeserta.value = peserta
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedpeserta.value = null
}

const formatTanggal = (tanggal) => {
  const date = new Date(tanggal)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}-${month}-${year} ${hours}:${minutes}`
}


onMounted(() => {
  fetchpesertas();
  const savedJobId = localStorage.getItem('export_job_id')
  if (savedJobId) {
    checkExportStatus(savedJobId)
  }

  const savedImportJobId = localStorage.getItem('import_job_id')
  if (savedImportJobId) {
    checkImportStatus(savedImportJobId)
  }
})
</script>