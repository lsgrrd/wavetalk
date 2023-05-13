import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LobbyView from '../views/Lobby.vue'
import RoomView from '../views/Room.vue'

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
      component: HomeView
    },
    {
      path: '/:id',
      name: 'room',
      component: RoomView
    },
  ]
})

export default router
