<template>
  <main class="text-slate-900 dark:text-slate-400 bg-white dark:bg-slate-900 min-h-screen">
    <div class="container mx-auto pt-8">

      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">
          Mono 🎥
        </h1>
        <label for="name" class="bg-gray-100 dark:bg-slate-800 ps-4 rounded-full overflow-hidden">
          Nombre :
          <input v-model="roomName" id="name" type="text" class="p-2 bg-gray-100 dark:bg-slate-800 outline-0	">
        </label>

      </div>
      <div class="mt-5 flex gap-4">
        <input type="text" id="room-id" class="text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-slate-700">
        <button id="confirmJoinBtn" class="p-2 dark:bg-slate-800 text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-slate-700" >confirm</button>
      </div>

      <div>
        <div id="currentRoom"></div>
      </div>

      <div id="videos" class="flex gap-20 mt-5 justify-center">
          <video id="localVideo" class="rounded-[40px]" muted autoplay playsinline></video>
          <video id="remoteVideo" class="rounded-[40px]" autoplay playsinline></video>
      </div>

      <div class="my-5 flex gap-4">
          <button id="cameraBtn" class="p-2 dark:bg-slate-800 text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-slate-700" @click="webRTCStore.openUserMedia()">Open camera & microphone</button>
          <button id="createBtn" class="p-2 dark:bg-slate-800 text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-slate-700" @click="webRTCStore.createRoom(roomName)">Create room</button>
          <button id="joinBtn" class="p-2 dark:bg-slate-800 text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-slate-700" @click="webRTCStore.joinRoom()">Join room</button>
          <button id="hangupBtn" class="p-2 dark:bg-slate-800 text-sm leading-6 text-slate-400 rounded-md ring-1 ring-slate-900/10 shadow-sm py-1.5 pl-2 pr-3 hover:ring-slate-300 dark:bg-slate-800 dark:highlight-white/5 dark:hover:bg-slate-700" @click="webRTCStore.hangUp(route.params.id)">Hangup</button>
      </div>

      
    </div>
  </main>
</template>

<script setup>
import { useWebRtcStore } from '../stores/webRTC';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const roomName = ref('');

const webRTCStore = useWebRtcStore();


</script>

<style lang="scss" scoped>

</style>