import router from './index'

router.beforeEach((to, from, next) => {
    if (to.meta.isLogin) {
        const token = window.sessionStorage.getItem('token')
        return token ? next() : next('/login')
    } else {
        next()
    }
})