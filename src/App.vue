<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App',
    sockets: {
      connect() {
        if (localStorage.getItem('empresa')) {
          this.$socket.emit('empresa_connected', localStorage.getItem('empresa'))
        }
      }
    },
  }
</script>

<style>
  .content {
    margin-top: 50px;
    margin-left: 70px;
    position: relative;
  }
  .pointer {
    cursor: pointer;
  }
</style>
