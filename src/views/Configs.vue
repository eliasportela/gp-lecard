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
            <input type="text" class="form-control" placeholder="Token da empresa" v-model="empresa" disabled>
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
        <div class="position-fixed" style="right: 14px; bottom: 12px;">
          <span class="small font-weight-bold">Versão: {{version}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');
const Config = require('electron-config');
const config = new Config();
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
      load: false,
      version: ''
    }
  },
  methods: {
    resetar() {
      config.clear();
      localStorage.clear();
      this.$router.push('/');
      ipcRenderer.send('reloud');
    },

    salvar() {
      let urlSocket = this.url_socket;
      let urlBase = this.url_base + (!this.url_base.endsWith('/') ? '/' : '');

      config.set('urlSocket', urlSocket);
      config.set('urlBase', urlBase);

      this.load = true;
      ipcRenderer.send('reloud');
    },

    buscar() {
      if (localStorage.getItem('urlSocket')) {
        this.url_socket = localStorage.getItem('urlSocket');
      }

      this.url_base = localStorage.getItem('urlBase') ? localStorage.getItem('urlBase') : 'https://softcomanda.tk/api/';

      if (localStorage.getItem('empresa')) {
        this.empresa = localStorage.getItem('empresa');
      }

      this.version = require('electron').remote.app.getVersion();
    }
  },
  created() {
    this.buscar();
  },
}
</script>
