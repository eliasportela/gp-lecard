<template>
  <div id="app">
    <div v-if="!load">
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
  const { ipcRenderer } = require('electron');

  export default {
    data() {
      return {
        load: true,
        empresas: [],
        key: '',
        nao_atenticou: false
      }
    },
    name: 'App',
    methods: {
      autenticar(e, callback) {
        this.$http.post('autenticar', {key: e.key})
          .then(res => {
            if (res.data.success) {
              const token = res.data.empresa;

              e.token = token;
              e.nome_fantasia = res.data.dados.nome_fantasia;
              e.email = res.data.dados.email;

              if (e.isDefault) {
                this.$store.commit('setDataUser', res.data);
                config.set("key", e.key);
                config.set("token", token);
                localStorage.setItem("key", e.key);
                localStorage.setItem("token", token);
              }

              callback(res);

            } else {
              this.$swal("Atenção!", "Não conseguimos autenticar sua empresa. Por favor tente novamente!");
              this.load = false;
            }

          }, res => {
            this.load = false;

            if (res.status === 401) {
              this.nao_atenticou = true;
              this.empresas = this.empresas.filter(el => el !== e);

              if (e.isDefault) {
                config.delete('key');
                localStorage.clear();
              }

              callback(res);

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
      },

      autenticarEmpresas(count) {
        if (count < this.empresas.length) {
          let e = this.empresas[count];
          this.autenticar(e, () => {
            this.autenticarEmpresas(++count);
          });

        } else {
          config.set('empresas', this.empresas);

          if (this.nao_atenticou) {
            if (!this.empresas.length) {
              this.clear();

            } else if (this.$route.name !== 'Empresas') {
              this.$router.push("/empresas")
            }
          }

          this.load = false;
        }
      }
    },

    mounted() {
      localStorage.clear();
      this.key = config.get('key');

      this.empresas = config.get('empresas') ? config.get('empresas') : [];
      this.$store.state.empresas = this.empresas;

      if (this.key) {
        const ia = config.get('impressaoAutomatica') ? config.get('impressaoAutomatica') : 0;
        const nCopias = config.get('nCopias') ? config.get('nCopias') : 1;
        const zoom = config.get('zoom') ? config.get('zoom') : 1;

        config.set('impressaoAutomatica', ia);
        localStorage.setItem('impressaoAutomatica', ia);
        config.set('nCopias', nCopias);
        localStorage.setItem('nCopias', nCopias);
        config.set('zoom', zoom);
        localStorage.setItem('zoom', zoom);

        if (config.get('device')) {
          localStorage.setItem('device', config.get('device'));
        }

        if (config.get('devicePdv')) {
          localStorage.setItem('devicePdv', config.get('devicePdv'));
        }

        this.autenticarEmpresas(0);

      } else {
        this.load = false;
        this.clear();
      }
    },

    sockets: {
      connect() {
        if (config.get('key')) {
          const empresas = config.get('empresas') ? config.get('empresas') : [];
          empresas.forEach(e => {
            this.$socket.emit('empresa_connected', e.token)
          });
        }
      },

      notification(res) {
        if (res.play) {
          this.$store.commit('setBell', true);
          this.playNotification(res.nome_fantasia);

        } else {
          this.$store.commit('setBell', false);
          this.pauseNotification();
        }
      },

      print(html) {
        if (html) {
          const options = {
            content: html,
            copies: localStorage.getItem('nCopias'),
            device: localStorage.getItem('devicePdv'),
            zoom: localStorage.getItem('zoom')
          };
          ipcRenderer.send('print', options);
        }
      }
    },
  }
</script>

<style>
  .content {
    margin-top: 60px;
    margin-left: 70px;
    position: relative;
  }

  .pointer {
    cursor: pointer;
  }

  .switch {
    width: 32px;
  }
</style>
