import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import './router/router'
import './assets/css/global.css'
import './plugins/element'
import 'assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

Vue.component('tree-table', TreeTable)

axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
axios.defaults.timeout = 5000
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
