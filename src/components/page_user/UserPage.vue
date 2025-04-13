<template>
    <Layout>
        <div class="container mt-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h2>Manajemen User</h2>
                <button class="btn btn-primary" @click="openModal">Tambah User</button>
            </div>

            <!-- Modal Form -->
            <div class="modal fade" id="userModal" tabindex="-1">
                <div class="modal-dialog">
                    <form class="modal-content" @submit.prevent="handleSubmit">
                        <div class="modal-header">
                            <h5 class="modal-title">{{ form.id ? 'Edit User' : 'Tambah User' }}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                                @click="resetForm"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-2">
                                <input v-model="form.name" type="text" class="form-control" placeholder="Nama"
                                    required />
                            </div>
                            <div class="mb-2">
                                <input v-model="form.email" type="email" class="form-control" placeholder="Email"
                                    required />
                            </div>
                            <div class="mb-2">
                                <input v-model="form.password" type="password" class="form-control"
                                    placeholder="Password" :required="!form.id" />
                            </div>
                            <div class="mb-2">
                                <label>Roles</label>
                                <select id="roleSelect" multiple class="form-select">
                                    <option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}
                                    </option>
                                </select>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                                @click="resetForm">Batal</button>
                            <button type="submit" class="btn btn-primary">{{ form.id ? 'Update' : 'Simpan' }}</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Table -->
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Roles</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in users" :key="user.id">
                        <td>{{ user.name }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                            <span v-for="role in user.roles" :key="role.id" class="badge bg-secondary me-1">{{ role.name
                                }}</span>
                        </td>
                        <td>
                            <button @click="editUser(user)" class="btn btn-sm btn-warning me-2">Edit</button>
                            <button @click="deleteUser(user.id)" class="btn btn-sm btn-danger">Hapus</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </Layout>
</template>

<script setup>
import Layout from '../layout/Layout.vue'
import { ref, onMounted } from 'vue'
import api from '../../axios'
import * as bootstrap from 'bootstrap'

const users = ref([])
const roles = ref([])
const form = ref({
    id: null,
    name: '',
    email: '',
    password: '',
    role_ids: []
})

let modalInstance = null

const fetchUsers = async () => {
    const res = await api.get('/user')
    users.value = res.data
}

const fetchRoles = async () => {
    const res = await api.get('/role')
    roles.value = res.data
}

const openModal = () => {
    modalInstance = new bootstrap.Modal(document.getElementById('userModal'))
    modalInstance.show()
    initSelect2()
}

const handleSubmit = async () => {
    if (form.value.id) {
        await api.put(`/user/${form.value.id}`, form.value)
    } else {
        await api.post('/user', form.value)
    }

    await fetchUsers()
    modalInstance.hide()
    resetForm()
}

const editUser = (user) => {
    form.value = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: '',
        role_ids: user.roles.map(r => r.id)
    }
    openModal()
}

const deleteUser = async (id) => {
    if (confirm('Yakin hapus user ini?')) {
        await api.delete(`/user/${id}`)
        await fetchUsers()
    }
}

const resetForm = () => {
    form.value = {
        id: null,
        name: '',
        email: '',
        password: '',
        role_ids: []
    }
    $('#roleSelect').val(null).trigger('change')
}

onMounted(() => {
    fetchUsers()
    fetchRoles()
})

import $ from 'jquery'
import select2 from 'select2';
select2();

const initSelect2 = () => {

    setTimeout(() => {
        const select = $('#roleSelect')

        select.select2({
            dropdownParent: $('#userModal'),
            width: '100%',
            placeholder: 'Pilih Role',
        })

        // Update Vue form when select2 changes
        select.on('change', () => {
            form.value.role_ids = select.val().map(id => parseInt(id))
        })

        // Set default values if editing
        if (form.value.role_ids?.length) {
            select.val(form.value.role_ids).trigger('change')
        }
    }, 100)
}
</script>