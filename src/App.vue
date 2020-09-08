<template>
  <div id="app">
    <div v-show="!load">
      <router-view/>
    </div>
    <div class="d-flex justify-content-center" style="height: 200px" v-if="load">
      <div class="m-auto text-center">
        <img src="./assets/logo-lecard.png" class="d-inline-block animated flipInY infinite" alt="Logo Lecard" style="width: 64px;">
      </div>
    </div>
  </div>
</template>

<script>
  const { ipcRenderer } = require('electron');
  const Config = require('electron-config');
  const config = new Config();

  export default {
    data() {
      return {
        load: true
      }
    },
    name: 'App',
    methods: {
      autenticar(key) {
        // console.log('autenticando: ' + key);
        this.$http.post('autenticar', {key})
          .then(res => {
            this.load = false;
            if (res.data.success) {
              this.$store.commit('setDataUser', res.data);
              if (this.$route.name === 'Login') {
                this.$router.push("/home")
              }

              if (config.get('whatsappBot')) {
                ipcRenderer.send('openWpp', {
                  ...res.data.dados
                });
              }

            } else {
              this.clear();
            }

          }, res => {
            this.load = false;
            this.$swal(res.data.result, res.data.msg);
            this.clear();
          });
      },

      clear() {
        config.delete('key');
        config.delete('empresa');
        localStorage.clear();
        if (this.$route.name !== 'Login') {
          this.$router.push("/")
        }
      }
    },

    mounted() {
      const key = config.get('key');
      if (key) {
        const ia = config.get('impressaoAutomatica') ? config.get('impressaoAutomatica') : 0;
        const nCopias = config.get('nCopias') ? config.get('nCopias') : 1;

        config.set('impressaoAutomatica', ia);
        localStorage.setItem('impressaoAutomatica', ia);
        config.set('nCopias', nCopias);
        localStorage.setItem('nCopias', nCopias);

        this.autenticar(key);

      } else {
        this.load = false;
        this.clear();
      }
    },

    sockets: {
      connect() {
        if (config.get('token')) {
          this.$socket.emit('empresa_connected', config.get('token'))
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
