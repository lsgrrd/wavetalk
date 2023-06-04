import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home.vue'
import LobbyView from '../views/Lobby.vue'
import RoomView from '../views/Room.vue'
import AdminView from '../views/Admin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: LobbyView
    },
    {
      path: '/waveadmin',
      name: 'admin',
      component: AdminView
    },
    {
      path: '/:id',
      name: 'room',
      component: RoomView
    },
  ]
})

export default router
