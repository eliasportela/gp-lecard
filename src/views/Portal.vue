<template>
  <div>
    <top-bar/>
    <div class="content">
      <div v-if="loading" style="padding-top: 28vh">
        <img src="../assets/logo-lecard.png" class="d-block m-auto animated flipInY infinite" alt="Logo Lecard" style="width: 72px;">
      </div>
      <div v-else>
        <webview :src="src" style="height: calc(100vh - 60px)"></webview>
      </div>
    </div>

  </div>
</template>
<script>
  import TopBar from "../components/TopBar";
  const Config = require('electron-config');
  const config = new Config();

  export default {
    components: {TopBar},
    data() {
      return {
        src: "",
        loading: true,
        token: localStorage.getItem('key'),
        webview: ''
      }
    },

    mounted() {
      const modo_homologacao = config.get('base_server');
      this.src = modo_homologacao ? "https://hhh.portal.lecard.delivery/" : process.env.VUE_APP_PORTAL;

      setTimeout(() => {
        this.loading = false;
      }, 1500);
    }
  }
</script>
<style>
</style>
