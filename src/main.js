const { ipcRenderer } = require('electron');
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueResource from 'vue-resource'
import VueSocketIO from 'vue-socket.io'
import VueSwal from 'vue-swal'
import store from './store'
import VueTheMask from 'vue-the-mask'
import VueFuse from 'vue-fuse'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'animate.css/animate.css'
import 'leaflet/dist/leaflet.css';

const Config = require('electron-config');
const config = new Config();

Vue.use(VueResource);
Vue.use(VueSwal);
Vue.use(VueTheMask);
Vue.use(VueFuse);

Vue.use(new VueSocketIO({
  debug: false,
  connection: process.env.VUE_APP_BASE_SOCKET
}));

const base_server = (config.get('base_server') ? config.get('base_server') : process.env.VUE_APP_BASE_SERVER);
Vue.config.productionTip = false;
Vue.http.options.emulateJSON = true;
Vue.http.options.emulateHTTP = true;
Vue.http.options.root = base_server + 'api/';

const audio = new Audio("https://lecard-cdn.nyc3.digitaloceanspaces.com/lecard-gestor/bell.mp3");
audio.loop = true;

Vue.mixin({
  data() {
    return { base_server }
  },
  methods: {
    playNotification() {
      if (audio.paused) {
        ipcRenderer.send('reloud-icon', true);
        audio.play();
        this.dialogNotify();
      }
    },

    pauseNotification() {
      ipcRenderer.send('reloud-icon', false);
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    },

    dialogNotify(empresa) {
      if (document.hasFocus()) {
        return;
      }

      const notification = new Notification(empresa ? ('LeCard - ' + empresa) : 'LeCard - Gestor de Pedidos', {
        body: 'Tem pedido novo na área ❤️',
        icon: document.getElementById('imgEmpresa').src
      });

      notification.onclick = (event) => {
        event.preventDefault();
        ipcRenderer.send('focus');

        if (this.$route.name !== 'Pedidos') {
          this.$router.push('/pedidos');
        }
      };
    }
  }
});

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
