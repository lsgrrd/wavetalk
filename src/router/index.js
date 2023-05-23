import { createRouter, createWebHistory } from 'vue-router'
import LobbyView from '../views/Lobby.vue'
import RoomView from '../views/Room.vue'
import AdminView from '../views/Admin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'lobby',
      component: LobbyView
    },
    {
      path: '/admin',
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
