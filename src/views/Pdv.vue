<template>
  <div>
    <top-bar @openPedidos="modal = true"/>
    <div class="content">
      <div v-if="loading" style="padding-top: 28vh">
        <img src="../assets/logo-lecard.png" class="d-block m-auto animated flipInY infinite" alt="Logo Lecard" style="width: 72px;">
      </div>
      <div v-show="!loading">
        <webview :src="src + 'auth/' + token" style="height: calc(100vh - 55px)" :preload="preload"></webview>
      </div>
    </div>

    <modal :opened="modal" width="full">
      <div class="container-fluid border-bottom pb-2 text-right">
        <button class="btn btn-outline-danger" style="margin-top: 10px" @click="modal = false">Voltar</button>
      </div>
      <container-pedidos/>
    </modal>

  </div>
</template>
<script>
  import TopBar from "../components/TopBar";
  import Modal from "../components/Modal";
  import ContainerPedidos from "../components/ContainerPedidos";
  export default {
    components: {ContainerPedidos, Modal, TopBar},
    data() {
      return {
        preload: `file://${require('path').join(__static, 'preload.js')}`,
        src: process.env.VUE_APP_COMANDA,
        loading: true,
        token: localStorage.getItem('key'),
        modal: false
      }
    },

    mounted() {
      const webview = document.querySelector('webview');

      webview.addEventListener('dom-ready', () => {
        // webview.openDevTools();
        this.loading = false;
      });
    }
  }
</script>
<style>
</style>
