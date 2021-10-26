<template>
  <div>
    <top-bar/>
    <div class="content">
      <div v-if="loading" style="padding-top: 28vh">
        <img src="../assets/logo-lecard.png" class="d-block m-auto animated flipInY infinite" alt="Logo Lecard" style="width: 72px;">
      </div>
      <div v-else>
        <webview :src="src + 'auth/' + token" style="height: calc(100vh - 60px)" :preload="preload"></webview>
      </div>
    </div>
  </div>
</template>
<script>
  const {ipcRenderer} = require('electron');
  import TopBar from "../components/TopBar";
  import ContainerPedidos from "../components/ContainerPedidos";
  const Config = require('electron-config');
  const config = new Config();

  export default {
    components: {ContainerPedidos, TopBar},
    data() {
      return {
        preload: `file://${require('path').join(__static, 'preload.js')}`,
        src: "",
        loading: true,
        token: localStorage.getItem('key'),
        webview: '',
      }
    },

    created() {
      const modo_homologacao = config.get('base_server');
      this.src = modo_homologacao ? "https://hhh.comanda.lecard.delivery/" : process.env.VUE_APP_COMANDA;

      setTimeout(() => {
        this.loading = false;
      }, 1500);
    }
  }
</script>
<style>
</style>
