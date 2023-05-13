<template>
  <main>
    <form @submit.prevent="joinRoom()" class="flex flex-col justify-center items-center min-h-screen">
      <h2 class="text-5xl mb-4">Room name</h2>
      <input type="text" v-model="roomName" class="p-5 ring-1 ring-slate-900/10 rounded-lg dark:bg-slate-800 text-center text-3xl">
      <button v-if="roomName"
        type="submit"
        class="mt-4 p-2 dark:bg-slate-800 text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-slate-700"
      >
        join
      </button>
    </form>
  </main>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const roomName = ref('');
const router = useRouter();

const joinRoom = () => {
  if (!roomName.value) return;
  router.push(`/${roomName.value}`);
}

</script>

<style lang="scss" scoped>

</style>