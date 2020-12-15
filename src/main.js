import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueResource from 'vue-resource'
import VueSocketIO from 'vue-socket.io'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'animate.css/animate.css'
import VueSweetalert2 from 'vue-sweetalert2'
import store from './store'
import VueTheMask from 'vue-the-mask'
import VueFuse from 'vue-fuse'

Vue.use(VueResource);
Vue.use(VueSweetalert2);
Vue.use(VueTheMask);
Vue.use(VueFuse);

Vue.use(new VueSocketIO({
  debug: false,
  connection: process.env.VUE_APP_BASE_SOCKET
}));

Vue.config.productionTip = false;
Vue.http.options.emulateJSON = true;
Vue.http.options.emulateHTTP = true;
Vue.http.options.root = process.env.VUE_APP_BASE_SERVER + 'api/';

Date.prototype.toDateInputValue = (function() {
  let local = new Date(this);
  local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
  return local.toJSON().slice(0,10);
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
