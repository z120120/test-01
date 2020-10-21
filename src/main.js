import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue'
import router from './router'
import store from './store'
import moment from 'moment'
import axios from 'axios'
import './assets/css/global.less'
import './assets/fonts/iconfont.css'
Vue.config.productionTip = false
Vue.use(ElementUI);
axios.defaults.baseURL="http://127.0.0.1:8888/api/private/v1/"
axios.interceptors.request.use(config=>{
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config;
})
Vue.prototype.$moment=moment
Vue.prototype.$axios=axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
