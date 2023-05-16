<template>
  <div class="text-slate-900 dark:text-slate-400 bg-white dark:bg-slate-900 min-h-screen p-0 m-0">
    <RouterView />
    <ThemeSwitch></ThemeSwitch>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import ThemeSwitch from './components/ThemeSwitch.vue';

</script>

<style>

</style>
