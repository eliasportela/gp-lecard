<template>
  <div id="app">
    <div v-show="!load">
      <router-view/>
    </div>
    <div class="d-flex justify-content-center" style="height: 200px" v-if="load">
      <div class="m-auto text-center">
        <img src="./assets/logo-lecard.png" class="d-inline-block animated flipInY infinite" alt="Logo Lecard"
             style="width: 64px;">
      </div>
    </div>
  </div>
</template>

<script>
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
        this.$http.post('autenticar', {key})
          .then(res => {
            this.load = false;
            if (res.data.success) {
              this.$store.commit('setDataUser', res.data);
              if (this.$route.name === 'Login') {
                this.$router.push("/home")
              }

              const token = res.data.empresa;
              config.set("key", key);
              config.set("token", token);
              localStorage.setItem("key", key);
              localStorage.setItem("token", token);

            } else {
              this.clear();
            }

          }, res => {
            this.load = false;
            if (res.status === 401) {
              this.$swal(res.data.result, res.data.msg);
              this.clear();

            } else if (!navigator.onLine) {
              this.$swal("Atenção!", "Não conseguimos acessar sua conexão com a internet. Por favor verifique se seu computador tem uma conexão estável.");
            }
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
        const zoom = config.get('zoom') ? config.get('zoom') : 1;

        config.set('impressaoAutomatica', ia);
        localStorage.setItem('impressaoAutomatica', ia);
        config.set('nCopias', nCopias);
        localStorage.setItem('nCopias', nCopias);
        config.set('zoom', zoom);
        localStorage.setItem('zoom', zoom);

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
