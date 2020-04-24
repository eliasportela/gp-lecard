<template>
  <div>
    <top-bar/>
    <div class="content">
      <h4 class="font-weight-bold p-3">Configurações do sistema</h4>
      <div class="container-fluid">
        <div class="row">
          <div class="col-4">
            <label class="font-weight-bold">Servidor Principal</label>
            <input type="text" class="form-control" placeholder="Url do servidor" v-model="url_base">
          </div>
          <div class="col-4">
            <label class="font-weight-bold">Servidor socket</label>
            <input type="text" class="form-control" placeholder="Url do socket" v-model="url_socket">
          </div>
          <div class="col-4">
            <label class="font-weight-bold">Token Empresa</label>
            <input type="text" class="form-control" placeholder="Url do servidor" v-model="empresa" disabled>
          </div>
        </div>
        <div class="row">
          <div class="col-4 mt-4">
            <button class="btn btn-danger btn-block" @click="salvar">{{load ? 'Salvo' : 'Salvar'}}</button>
          </div>
        </div>
        <hr class="my-5">
        <h4 class="font-weight-bold mb-4 text-danger">Danger zone</h4>
        <div class="row">
          <div class="col-4 ">
            <button class="btn btn-dark btn-block" @click="resetar">Resetar sistema</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');
import TopBar from '@/components/TopBar.vue'

export default {
  name: 'Configs',
  components: {
    TopBar
  },
  data() {
    return {
      url_socket: '',
      url_base: '',
      empresa: '',
      load: false
    }
  },
  methods: {
    resetar() {
      localStorage.clear();
      this.$router.push('/');
    },

    salvar() {
      localStorage.setItem('urlSocket', this.url_socket + (!this.url_socket.endsWith('/') ? '/' : ''));
      localStorage.setItem('urlBase', this.url_base + (!this.url_base.endsWith('/') ? '/' : ''));
      this.buscar();
      this.load = true;
      ipcRenderer.send('relaunch-app');
    },
    buscar() {
      if (localStorage.getItem('urlSocket')) {
        this.url_socket = localStorage.getItem('urlSocket');
      }

      this.url_base = localStorage.getItem('urlBase') ? localStorage.getItem('urlBase') : 'https://softcomanda.tk/api/';

      if (localStorage.getItem('empresa')) {
        this.empresa = localStorage.getItem('empresa');
      }
    }
  },
  created() {
    this.buscar();
  },
}
</script>
