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
import dayjs from 'dayjs'

// 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

Vue.component('tree-table', TreeTable)

axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
axios.defaults.timeout = 5000
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

// 过滤时间 - 》 换成 dayjs
// require styles css样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 注册插件
Vue.use(VueQuillEditor, /* { default global options } */)

Vue.filter('getDay', function (day) {
  let dy = dayjs(day)
  let now = dayjs()
  if (dy.isSame(now, 'day')) {
    return '今天'
  } else {
    return dy.format('YYYY年-MM月-DD日')
  }
})
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}+${m}+${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
