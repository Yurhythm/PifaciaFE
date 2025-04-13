<template>
  <Layout>

    <div>
      <h2 class="mb-4">Tiket</h2>

      <div class="d-flex justify-content-between mb-3">
        <input v-model="search" @input="fetchtikets()" class="form-control w-25" placeholder="Cari tiket..." />
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
          <button class="btn btn-primary" @click="openCreateModal">Tambah Tiket</button>
        </div>
      </div>

      <table class="table table-bordered">
        <thead>
          <tr>
            <th @click="sort('judul')" style="cursor: pointer">Event</th>
            <th @click="sort('tipe')" style="cursor: pointer">Tipe</th>
            <th @click="sort('harga')" style="cursor: pointer">Harga</th>
            <th @click="sort('tersedia')" style="cursor: pointer">Tersedia</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tiket in tikets.data" :key="tiket.id">
            <td>{{ tiket.judul }}</td>
            <td>{{ tiket.tipe }}</td>
            <td>{{ tiket.harga }}</td>
            <td>{{ tiket.tersedia ? 'Ya' : 'Tidak' }}</td>
            <td>
              <button class="btn btn-sm btn-warning me-1" @click="edittiket(tiket)">Edit</button>
              <button class="btn btn-sm btn-danger" @click="deletetiket(tiket.id)">Hapus</button>
            </td>
          </tr>
        </tbody>
      </table>

      <nav>
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: !tikets.prev_page_url }">
            <button class="page-link" @click="fetchtikets(tikets.prev_page_url)">Prev</button>
          </li>
          <li class="page-item" :class="{ disabled: !tikets.next_page_url }">
            <button class="page-link" @click="fetchtikets(tikets.next_page_url)">Next</button>
          </li>
        </ul>
      </nav>

      <hr>

      <tiketForm :show="showForm" :tiket="selectedtiket" @close="closeForm" @saved="fetchtikets" />
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
import tiketForm from '../page_tiket/TiketForm.vue'
import AuditTrail from '../page_tiket/AuditTrail.vue'

const tikets = ref({})
const search = ref('')
const sortBy = ref('judul')
const sortDir = ref('asc')
const showForm = ref(false)
const selectedtiket = ref(null)

const fetchtikets = async (url = null) => {
  const params = {
    search: search.value,
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
  }

  const res = await api.get(url || '/tiket', { params })
  tikets.value = res.data
}

const sort = (field) => {
  if (sortBy.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDir.value = 'asc'
  }
  fetchtikets()
}

const deletetiket = async (id) => {
  const result = await Swal.fire({
    title: 'Hapus tiket ini?',
    text: 'Tindakan ini tidak bisa dibatalkan!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal'
  })

  if (result.isConfirmed) {
    try {
      await api.delete(`/tiket/${id}`)
      await Swal.fire({
        title: 'Berhasil!',
        text: 'Tiket berhasil dihapus.',
        icon: 'success',
        confirmButtonText: 'Oke'
      })
      fetchtikets()
    } catch (error) {
      Swal.fire({
        title: 'Gagal!',
        text: 'Terjadi kesalahan saat menghapus tiket.',
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
    const res = await api.post('/tiket/import', formData)
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
        fetchtikets()
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
const selectedFields = ref(['event_judul']) // default
const availableFields = [
  'event_judul',
  'tipe',
  'harga',
  'tersedia',
  'fitur',
]

const isExporting = ref(false)

const exportData = async () => {
  try {
    isExporting.value = true
    const res = await api.post('/tiket/export', {
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
  selectedtiket.value = null
  showForm.value = true
}

const edittiket = (tiket) => {
  selectedtiket.value = tiket
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
  selectedtiket.value = null
}

const formatTanggal = (tanggal) => {
  const date = new Date(tanggal)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0') // karena bulan mulai dari 0
  const year = date.getFullYear()

  return `${day}-${month}-${year}`
}


onMounted(() => {
  fetchtikets();
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