<template>
  <main class="flex flex-col items-center justify-center min-h-screen">
    <div class="flex justify-center flex-col align-center">
      <span class="material-symbols-outlined logo">
        airwave
      </span>
      <h2 class="text-3xl mb-10">waveTalk</h2>
    </div>
    <form @submit.prevent="joinRoom()" class="flex flex-col justify-center items-center  container mx-auto px-4">
      <input type="text"
        v-model="roomName"
        placeholder="Room name"
        class="p-5 ring-1 ring-slate-900/10 rounded-lg dark:bg-slate-800 text-center text-3xl w-full max-w-lg"
      >
      <button v-if="roomName"
        type="submit"
        class="flex items-center justify-center aspect-square mt-4 p-5 bg-green-600 dark:bg-green-600 leading-1 text-white rounded-full ring-1 ring-slate-900/10 shadow-sm  dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-green-700"
      >
        <span class="material-symbols-outlined">
          call
        </span>
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
.logo {
  font-size: 130px;
}
</style>