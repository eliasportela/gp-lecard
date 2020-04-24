import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueResource from 'vue-resource'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'animate.css/animate.css'
import VueSweetalert2 from 'vue-sweetalert2'

Vue.use(VueResource);
Vue.use(VueSweetalert2);

Vue.config.productionTip = false;

const url_base = 'https://softcomanda.tk/api';
Vue.http.options.root = localStorage.getItem('urlBase') ? localStorage.getItem('urlBase') : url_base;
Vue.http.options.emulateJSON = true;
Vue.http.options.emulateHTTP = true;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');