<template>
    <div class="d-flex align-items-center justify-content-center bg-light mt-5">
      <div class="card shadow-sm p-4" style="min-width: 350px; max-width: 400px; width: 100%;">
        <div class="text-center mb-3">
          <h3 class="text-primary">Login</h3>
        </div>
  
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input v-model="email" type="email" class="form-control" id="email" required />
          </div>
  
          <div class="mb-3">
            <label for="password" class="form-label">Password</label>
            <input v-model="password" type="password" class="form-control" id="password" required />
          </div>
  
          <div v-if="error" class="alert alert-danger py-2 px-3">
            {{ error }}
          </div>
  
          <button type="submit" class="btn btn-primary w-100">Login</button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import api from '../axios'
  import { useRouter } from 'vue-router'
  
  const email = ref('')
  const password = ref('')
  const error = ref(null)
  const router = useRouter()
  
  const handleLogin = async () => {
    try {
      const res = await api.post('/login', {
        email: email.value,
        password: password.value
      })
  
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      router.push('/dashboard')
    } catch (err) {
      error.value = err.response?.data?.message || 'Login gagal'
    }
  }
  </script>