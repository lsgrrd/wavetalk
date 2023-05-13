<template>
  <main class="text-slate-900 dark:text-slate-400 bg-white dark:bg-slate-900 min-h-screen">
    <div class="container mx-auto pt-8">

      <div class="flex items-center justify-between">
        <router-link to="/">
          <h1 class="text-3xl font-bold">
            {{ route.params.id }}
          </h1>
        </router-link>
      </div>

      <div>
        <div id="currentRoom"></div>
      </div>

      <div id="videos" class="flex gap-20 mt-5 justify-center">
          <video id="localVideo" class="rounded-[40px]" muted autoplay playsinline></video>
          <video id="remoteVideo" class="rounded-[40px]" autoplay playsinline></video>
      </div>

      <div class="my-5 flex gap-4 justify-center">
          <router-link to="/" id="hangupBtn" class="flex p-2 aspect-square items-center justify-center rounded-full bg-red-600 dark:bg-red-600 text-sm leading-6 text-white ring-1 ring-slate-900/10 shadow-sm dark:hover:bg-red-700">
            <span class="material-symbols-outlined">
              call_end
            </span>
          </router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useWebRtcStore } from '../stores/webRTC';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const webRTCStore = useWebRtcStore();

const id = ref(route.params.id)

const showVideo = ref(false)

watch(() => webRTCStore.remoteStream, (newVal) => {
  if (newVal) {
    showVideo.value = true
    debugger
  }
})

onMounted(async () => {
  await webRTCStore.openUserMedia()
  webRTCStore.handleRoomConnection(route.params.id)
})

onBeforeUnmount(() => {
  const tracks = document.querySelector("#localVideo").srcObject.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });

  document.querySelector("#localVideo").srcObject = null;
  document.querySelector("#remoteVideo").srcObject = null;
  document.querySelector("#currentRoom").innerText = "";
  webRTCStore.hangUp(id.value)
})

</script>

<style lang="scss" scoped>

</style>