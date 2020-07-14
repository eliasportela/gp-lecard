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
  let urlBase = 'https://api.storkdigital.com.br/api/';
  config.set('urlBase', urlBase);
  localStorage.setItem('urlBase', urlBase);
}

if (config.get('empresa')) {
  localStorage.setItem('empresa', config.get('empresa'));

  if (config.get('dominio')) {
    localStorage.setItem('dominio', config.get('dominio'));
  }

  if (config.get('urlSocket')) {
    localStorage.setItem('urlSocket', config.get('urlSocket'));

    Vue.use(new VueSocketIO({
      debug: false,
      connection: config.get('urlSocket')
    }));

    console.log(config.get('urlSocket'))
  }
}

if (config.get('nCopias')) {
  localStorage.setItem('nCopias', config.get('nCopias'))
} else {
  localStorage.setItem('nCopias', '1')
}

if (config.get('impressaoAutomatica')) {
  localStorage.setItem('impressaoAutomatica', '1');
}

Vue.config.productionTip = false;
Vue.http.options.emulateJSON = true;
// Vue.http.options.emulateHTTP = true;
// console.log(Vue.http.options.root);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app');
