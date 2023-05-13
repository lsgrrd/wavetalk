<template>
  <div class="text-slate-900 dark:text-slate-400 bg-white dark:bg-slate-900 min-h-screen">
    <RouterView />
    <ThemeSwitch></ThemeSwitch>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
import ThemeSwitch from './components/ThemeSwitch.vue';
const themeToggle = () => {
  document.documentElement.classList.toggle('dark');
}
</script>

<style scoped>

</style>
