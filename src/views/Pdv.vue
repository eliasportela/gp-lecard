<template>
  <div>
    <top-bar/>
    <div class="content">
      <div v-if="loading" style="padding-top: 28vh">
        <img src="../assets/logo-lecard.png" class="d-block m-auto animated flipInY infinite" alt="Logo Lecard" style="width: 72px;">
      </div>
      <div v-show="!loading">
        <webview :src="src + 'auth/' + token" style="height: calc(100vh - 60px)" :preload="preload"></webview>
      </div>
    </div>
  </div>
</template>
<script>
  const {ipcRenderer} = require('electron');
  import TopBar from "../components/TopBar";
  import ContainerPedidos from "../components/ContainerPedidos";

  export default {
    components: {ContainerPedidos, TopBar},
    data() {
      return {
        preload: `file://${require('path').join(__static, 'preload.js')}`,
        src: process.env.VUE_APP_COMANDA,
        loading: true,
        token: localStorage.getItem('key'),
        webview: '',
      }
    },

    methods: {
      openDevTools() {
        if (this.webview && !this.webview.isLoading()) {
          // this.webview.openDevTools();
        }
      }
    },

    mounted() {
      this.webview = document.querySelector('webview');
      this.webview.addEventListener('dom-ready', () => {
        this.loading = false;
        // console.log(this.webview)
        // this.webview.openDevTools();
      });
    },

    created() {
      ipcRenderer.on("openDevTools", () => {
        this.openDevTools();
      });
    }
  }
</script>
<style>
</style>
