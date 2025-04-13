<template>
    <Layout>
        <div class="container py-4">
            <div class="d-flex justify-content-between mb-3">
                <h4>Role Management</h4>
                <button @click="openModal()" class="btn btn-primary">Tambah Role</button>
            </div>

            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Permissions</th>
                        <th style="width: 140px;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="role in roles" :key="role.id">
                        <td>{{ role.name }}</td>
                        <td>
                            <span v-for="perm in role.permissions" :key="perm.id" class="badge bg-info me-1">{{
                                perm.name
                            }}</span>
                        </td>
                        <td>
                            <button @click="editRole(role)" class="btn btn-sm btn-warning me-1">Edit</button>
                            <button @click="deleteRole(role.id)" class="btn btn-sm btn-danger">Hapus</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Modal -->
            <div class="modal fade" id="roleModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <form @submit.prevent="submitForm">
                            <div class="modal-header">
                                <h5 class="modal-title">{{ form.id ? 'Edit Role' : 'Tambah Role' }}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                                    @click="resetForm"></button>
                            </div>
                            <div class="modal-body">
                                <div class="mb-3">
                                    <label>Nama Role</label>
                                    <input v-model="form.name" type="text" class="form-control" required>
                                </div>
                                <div class="mb-3">
                                    <label>Permissions</label>
                                    <select id="permissionSelect" multiple class="form-select">
                                        <option v-for="p in allPermissions" :key="p.id" :value="p.id">{{ p.name }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                                    @click="resetForm">Batal</button>
                                <button type="submit" class="btn btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </Layout>
</template>

<script setup>
import Layout from '../layout/Layout.vue'
import { ref, onMounted } from 'vue'
import api from '../../axios'
import * as bootstrap from 'bootstrap'


const roles = ref([])
const allPermissions = ref([])
const form = ref({ id: null, name: '', permissions: [] })
let modalInstance = null

const fetchRoles = async () => {
    const res = await api.get('/role')
    roles.value = res.data
}

const fetchPermissions = async () => {
    const res = await api.get('/permissions-list')
    allPermissions.value = res.data
}

const openModal = () => {
    modalInstance = new bootstrap.Modal(document.getElementById('roleModal'))
    modalInstance.show()
    initSelect2()
}

const editRole = (role) => {
    form.value = {
        id: role.id,
        name: role.name,
        permissions: role.permissions.map(p => p.id)
    }
    openModal()
}

const resetForm = () => {
    form.value = { id: null, name: '', permissions: [] }
    $('#permissionSelect').val(null).trigger('change')
}

const submitForm = async () => {
    if (form.value.id) {
        await api.put(`/role/${form.value.id}`, {
            name: form.value.name,
            permissions: form.value.permissions
        })
    } else {
        await api.post('/role', {
            name: form.value.name,
            permissions: form.value.permissions
        })
    }
    modalInstance.hide()
    resetForm()
    fetchRoles()
}

const deleteRole = async (id) => {
    if (confirm('Yakin ingin menghapus role ini?')) {
        await api.delete(`/role/${id}`)
        fetchRoles()
    }
}

onMounted(() => {
    fetchRoles()
    fetchPermissions()
})

import $ from 'jquery'
import select2 from 'select2';
select2();

const initSelect2 = () => {

setTimeout(() => {
    const select = $('#permissionSelect')

    select.select2({
        dropdownParent: $('#roleModal'),
        width: '100%',
        placeholder: 'Pilih Permission',
    })

    select.on('change', () => {
        form.value.permissions = select.val().map(id => parseInt(id))
    })

    if (form.value.permissions?.length) {
        select.val(form.value.permissions).trigger('change')
    }
}, 100)
}
</script>