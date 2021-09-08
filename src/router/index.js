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
    },
    redirect: '/hello',
    children: [
      {
        path: '/hello',
        name: 'Hello',
        component: () => import('@/components/homeComps/HelloWorld.vue')
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('@/components/users/Users.vue')
      },
      {
        path: '/rights',
        name: 'Rights',
        component: () => import('@/components/power/Rights.vue')
      },
      {
        path: '/roles',
        name: 'Roles',
        component: () => import('@/components/power/Roles.vue')
      },
      {
        path:'/categories',
        name:'Cate',
        component: () => import('@/components/goods/Cate.vue')
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
