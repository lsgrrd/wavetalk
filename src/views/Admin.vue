<template>
 <main>
    <div class="container mx-sm mx-auto py-5 px-4">
      <div v-if="rooms.length > 0">
        <div v-for="room in rooms" class="py-2 pl-5 pr-2 bg-slate-400 dark:bg-slate-800 rounded-full flex justify-between mb-3 cursor-pointer" @click.self="router.push({ name: 'room', params: { id:room.id }})">
          <div class="text-xl flex items-center">
            {{ room.id }}
            <div class="text-sm ml-2">
              {{room.offer?.by}} & {{room.answer?.by}}
            </div>
          </div>
          <div class="flex items-center">
            <span class="text-sm mr-5">
              {{ dayjs(room.createdAt).fromNow() }}
            </span>
            <div class="rounded-full aspect-square flex items-center align-center hover:bg-red-600 hover:text-white cursor-pointer py-1 px-2"
              @click="deleteRoom(room.id)"
            >
              <span class="material-symbols-outlined text-base">
                delete
              </span>
            </div>
          </div>


        </div>
      </div>
      <div v-else>
        <div class="text-xl">
          No rooms yet
        </div>
      </div>
    </div>
 </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import db from '../firebase/init.js';
import { collection, query, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useRouter } from 'vue-router';
dayjs.extend(relativeTime)


const router = useRouter();
const rooms = ref([]);

const deleteRoom = async (id) => {
  deleteDoc(doc(db, "rooms", id));
}

onMounted(async () => {
  const q = query(collection(db, "rooms"));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    rooms.value = [];
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
      rooms.value.push({ id: doc.id, createdAt: doc.data().offer.createdAt, ...doc.data() });
    });
  });

  unsubscribe

});

</script>

<style lang="scss" scoped>

</style>
