<template>
  <main class="px-4 sm:px-0">
    <div class="container mx-auto pt-4 pb-8">
      <div class="flex items-center justify-between">
        <div class="mb-3">
          <div class="text-xs p-0 mb-0">
            Room:
          </div>
          <div class="text-[30px] leading-5 font-bold text-black dark:text-white">
            {{ route.params.id }}
          </div>
        </div>

        <div class="flex align-center">
          <span class="material-symbols-outlined text-base mr-2">
            timer
          </span> {{ timer }}
        </div>

        <div>
          <div id="currentRoom" class="rounded-full px-2 bg-slate-400 text-white font-bold dark:bg-slate-600"></div>
        </div>
      </div>
      <div id="videos" class="flex gap-10 mt-5 justify-center flex-wrap items-center">
        <div v-show="webRTCStore.isGuestActive" class="relative">
          <video  id="remoteVideo" class="video-stream rounded-[22px]" autoplay playsinline></video>
          <div v-show="webRTCStore.guestName && webRTCStore.hostName" class="absolute bottom-0 m-2 py-2 px-4 rounded-full bg-sky-700 text-white font-black">{{ webRTCStore.isHost ? webRTCStore.guestName : webRTCStore.hostName }}</div>
        </div>
        <div class="relative flex items-end">
          <video id="localVideo" class="video-stream rounded-[22px]" muted autoplay playsinline></video>
          <div class="absolute bottom-0 m-2 py-2 px-4 rounded-full bg-sky-700 text-white font-black">{{ webRTCStore.isHost ? webRTCStore.hostName : webRTCStore.guestName }}</div>
        </div>
      </div>

      <div class="my-5 flex gap-4 justify-center">
        <div v-if="!webRTCStore.isVideoOff" @click="webRTCStore.videoOff()" id="hangupBtn" class="cursor-pointer flex p-5 aspect-square items-center justify-center rounded-full bg-slate-400 dark:bg-slate-600 text-sm leading-6 text-white ring-1 ring-slate-900/10 shadow-sm dark:hover:bg-slate-700">
            <span class="material-symbols-outlined">
              videocam
            </span>
          </div>

          <div v-else @click="webRTCStore.videoOn()" id="hangupBtn" class="cursor-pointer flex p-5 aspect-square items-center justify-center rounded-full bg-slate-400 dark:bg-slate-600 text-sm leading-6 text-white ring-1 ring-slate-900/10 shadow-sm dark:hover:bg-slate-700">
            <span class="material-symbols-outlined">
              videocam_off
            </span>
          </div>

          <div v-if="!webRTCStore.isMicMuted" @click="webRTCStore.muteMic()" id="hangupBtn" class="cursor-pointer flex p-5 aspect-square items-center justify-center rounded-full bg-slate-400 dark:bg-slate-600 text-sm leading-6 text-white ring-1 ring-slate-900/10 shadow-sm dark:hover:bg-slate-700">
            <span class="material-symbols-outlined">
              mic
            </span>
          </div>

          <div v-else @click="webRTCStore.unMuteMic()" id="hangupBtn" class="cursor-pointer flex p-5 aspect-square items-center justify-center rounded-full bg-slate-400 dark:bg-slate-600 text-sm leading-6 text-white ring-1 ring-slate-900/10 shadow-sm dark:hover:bg-slate-700">
            <span class="material-symbols-outlined">
              mic_off
            </span>
          </div>

          <div v-if="!webRTCStore.isScreenSharing && !isMobile" @click="webRTCStore.shareScreen()" id="hangupBtn" class="cursor-pointer flex p-5 aspect-square items-center justify-center rounded-full bg-slate-400 dark:bg-slate-600 text-sm leading-6 text-white ring-1 ring-slate-900/10 shadow-sm dark:hover:bg-slate-700">
            <span class="material-symbols-outlined">
              screen_share
            </span>
          </div>
          <div v-if="webRTCStore.isScreenSharing && !isMobile" @click="webRTCStore.stopScreenShare()" id="hangupBtn" class="cursor-pointer flex p-5 aspect-square items-center justify-center rounded-full bg-slate-400 dark:bg-slate-600 text-sm leading-6 text-white ring-1 ring-slate-900/10 shadow-sm dark:hover:bg-slate-700">
            <span class="material-symbols-outlined">
              stop_screen_share
            </span>
          </div>

          <div
            id="hangupBtn"
            class="cursor-pointer flex p-5 aspect-square items-center justify-center rounded-full bg-red-600 dark:bg-red-600 text-sm leading-6 text-white ring-1 ring-slate-900/10 shadow-sm dark:hover:bg-red-700"
            @click="webRTCStore.hangUp(id)"
          >
            <span class="material-symbols-outlined">
              call_end
            </span>
          </div>
      </div>
      <div>
        <video id="screen-share" class="video-stream rounded-[22px]" muted autoplay playsinline></video>
        {{ JSON.stringify(webRTCStore.streamInfo) }}
      </div>
    </div>
  </main>
</template>

<script setup>
import { useWebRtcStore } from '../stores/webRTC';
import { ref, onMounted, onUnmounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const webRTCStore = useWebRtcStore();

const id = ref(route.params.id)

const isMobile = ref(false)

const timer = ref('00:00:00')

const startTimer = () => {
  let seconds = 0
  let minutes = 0
  let hours = 0

  setInterval(() => {
    seconds++

    if (seconds === 60) {
      seconds = 0
      minutes++
    }

    if (minutes === 60) {
      minutes = 0
      hours++
    }

    timer.value = `${hours}:${minutes}:${seconds}`

  }, 1000)
}

onMounted(async () => {
  await webRTCStore.openUserMedia()
  webRTCStore.handleRoomConnection(route.params.id)
  startTimer()

  if (navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)) {
    isMobile.value = true ;
  } else {
    isMobile.value = false ;
  }
})

onBeforeUnmount(() => {
  const tracks = document.querySelector("#localVideo").srcObject.getTracks();
  tracks.forEach((track) => {
    track.stop();
  });

  document.querySelector("#localVideo").srcObject = null;
  document.querySelector("#remoteVideo").srcObject = null;
  document.querySelector("#currentRoom").innerText = "";
})

onUnmounted(() => {
  webRTCStore.hangUp(id.value)
})

window.addEventListener("beforeunload", function (e) {
  webRTCStore.hangUp(id.value)
});

window.onbeforeunload = function (e) {
  if (e.target.value == true) {
    webRTCStore.hangUp(id.value)
  } else {
    webRTCStore.hangUp(id.value)
  }
};

</script>

<style lang="scss" scoped>
#videos {
  max-width: 100vw;
}

.video-stream {
  max-width: 100%;
}

</style>