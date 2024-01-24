import { createRouter, createWebHistory } from 'vue-router'

import login from '../views/login.vue'
import home from '../views/home.vue'
import admin from '../views/admin.vue'
import audio from '../views/audio.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: login
    },
    {
      path: '/home',
      name: 'home',
      component: home
    },
    {
      path: '/admin',
      name: 'admin',
      component: admin
    },
    {
      path:'/audio',
      name: 'audio',
      component:audio
    },
  ]
})

export default router
