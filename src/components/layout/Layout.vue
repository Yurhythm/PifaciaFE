<template>
    <div class="d-flex">
        <Sidebar />
        <div class="flex-grow-1 p-4" style="min-height: 100vh;">
            <slot />
        </div>
    </div>
</template>

<script setup>
import Sidebar from '../../components/layout/Sidebar.vue'
</script>