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

Vue.http.options.emulateJSON = true;
// Vue.http.options.emulateHTTP = true;
// console.log(Vue.http.options.root);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');