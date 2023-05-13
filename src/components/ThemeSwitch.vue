<template>
  <button class="fixed flex bottom-10 right-10 rounded-full p-2 aspect-square ring-1 ring-slate-900/10 dark:bg-slate-800" @click="themeToggle()">
    <span class="material-symbols-outlined m-0 p-0">
      {{ theme === 'light' ? 'dark_mode' : 'light_mode' }}
    </span>
  </button>
</template>

<script setup>
import { ref } from 'vue';

const theme = ref('light')

if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  theme.value = 'dark'
  document.documentElement.classList.add('dark')
} else {
  theme.value = 'light'
  document.documentElement.classList.remove('dark')
}

const themeToggle = () => {
  document.documentElement.classList.toggle('dark');
  if (document.documentElement.classList.contains('dark')) {
    localStorage.theme = 'dark';
    theme.value = 'dark'
  } else {
    localStorage.theme = 'light';
    theme.value = 'light'
  }
}
</script>

<style lang="scss" scoped>
</style>
