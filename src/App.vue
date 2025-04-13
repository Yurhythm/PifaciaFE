<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary px-4">
      <router-link to="/" class="navbar-brand">Pifacia Tes</router-link>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link"><b>Home</b></router-link>
          </li>
          <li class="nav-item" v-if="!isLoggedIn">
            <router-link to="/login" class="nav-link"><b>Login</b></router-link>
          </li>
          <li class="nav-item" v-else>
            <router-link to="/dashboard" class="nav-link"><b>Dashboard</b></router-link>
          </li>
        </ul>
      </div>
    </nav>

    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const isLoggedIn = computed(() => !!localStorage.getItem('token'))
</script>

<style>
body {
  background-color: #faf9f8;
}
</style>