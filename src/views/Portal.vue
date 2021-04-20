<template>
  <div>
    <top-bar/>
    <div class="content">
      <div v-if="loading" style="padding-top: 28vh">
        <img src="../assets/logo-lecard.png" class="d-block m-auto animated flipInY infinite" alt="Logo Lecard" style="width: 72px;">
      </div>
      <div v-show="!loading">
        <!--<webview :src="src + 'auth/' + token" style="height: calc(100vh - 60px)"></webview>-->
        <webview :src="src" style="height: calc(100vh - 60px)"></webview>
      </div>
    </div>

  </div>
</template>
<script>
  import TopBar from "../components/TopBar";

  export default {
    components: {TopBar},
    data() {
      return {
        src: process.env.VUE_APP_PORTAL,
        loading: true,
        token: localStorage.getItem('key'),
        webview: ''
      }
    },

    mounted() {
      this.webview = document.querySelector('webview');
      this.webview.addEventListener('dom-ready', () => {
        this.loading = false;
      });
    }
  }
</script>
<style>
</style>
