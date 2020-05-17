import Vue from 'vue'
import App from './App.vue'
import router from './router'
const { ipcRenderer } = require('electron');
const Config = require('electron-config');
import VueResource from 'vue-resource'
import VueSocketIO from 'vue-socket.io'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'jquery'
import 'animate.css/animate.css'
import VueSweetalert2 from 'vue-sweetalert2'
const config = new Config();

Vue.use(VueResource);
Vue.use(VueSweetalert2);

if (config.get('urlBase')) {
  localStorage.setItem('urlBase', config.get('urlBase'));

} else {
  let urlBase = 'https://softcomanda.tk/api/';
  config.set('urlBase', urlBase);
  localStorage.setItem('urlBase', urlBase);
}

if (config.get('empresa')) {
  localStorage.setItem('empresa', config.get('empresa'));

  if (config.get('urlSocket')) {
    localStorage.setItem('urlSocket', config.get('urlSocket'));

    const base_socket = config.get('urlSocket') + config.get('empresa');
    console.log(base_socket);
    Vue.use(new VueSocketIO({
      debug: false,
      connection: base_socket
    }));
  }
}

if (config.get('nCopias')) {
  localStorage.setItem('nCopias', config.get('nCopias'))
} else {
  localStorage.setItem('nCopias', '1')
}

Vue.config.productionTip = false;
Vue.http.options.emulateJSON = true;
// Vue.http.options.emulateHTTP = true;
// console.log(Vue.http.options.root);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');