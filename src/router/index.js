import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('@/components/Home.vue'),
    meta: {
      isLogin: true
    }
  }
]

const router = new VueRouter({
  routes
})

export default router
