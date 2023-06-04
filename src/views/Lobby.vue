<template>
  <main class="main-grid">
    <div class="pl-5 pt-9 font-bold text-2xl">
      <Logo />
    </div>
    <div class="flex flex-wrap items-center justify-around container mx-auto">
      <div class="dark:text-white mx-5 flex justify-center">
        <div class="py-4 rounded-2xl bg-red-600 text-center shadow-lg">
          <div class="text-4xl font-black">
            HELLO
          </div>
          <div class="font-bold">
            my name is
          </div>
          <div class="bg-white mt-3">
            <input type="text" class="px-5 font-bold py-7 text-black text-center text-5xl max-w-xs sm:max-w-sm name" v-model="username" @change="updateName()">
          </div>
        </div>
      </div>
      <div class="hidden lg:flex border-r-2 border-slate-900 h-40	mx-5"></div>
      <div class="mx-5">
        <form @submit.prevent="joinRoom()" class="flex flex-col justify-center items-end">
          <div class="pt-3 rounded-lg dark:bg-slate-800 max-w-md shadow-lg">
            <div class="px-5">
              Room name
            </div>
            <input type="text"
              v-model="roomName"
              class="px-5 mt-2 py-2 bg-transparent text-3xl w-full "
            >
          </div>
          <button :disabled="!roomName"
            type="submit"
            class="flex items-center justify-center aspect-square mt-4 p-5 bg-green-600 dark:bg-green-600 leading-1 text-white rounded-full ring-1 ring-slate-900/10 shadow-sm  dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-green-700"
          >
            <span class="material-symbols-outlined">
              call
            </span>
          </button>
        </form>
      </div>
    </div>
    <div class="p-4">
      <blockquote class="text-lg font-semibold italic text-center text-slate-500">
        When you look
        <span class="before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-indigo-500 relative inline-block">
          <span class="relative text-white">annoyed</span>
        </span>
        all the time, people think that you're busy.
      </blockquote>
    </div>
  </main>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import Logo from '../components/Logo.vue';

const username = ref(localStorage.getItem('localName') || '')

const roomName = ref('');
const router = useRouter();

const joinRoom = () => {
  if (!roomName.value) return;
  router.push(`/${roomName.value}`);
}

const updateName = () => {
  localStorage.setItem('localName', username.value)
}

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;700&display=swap');
.name {
  font-family: 'Kalam', cursive;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}
</style>