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

  export default {
    data() {
      return {
        load: true,
        empresas: []
      }
    },
    name: 'App',
    methods: {
      async autenticar(key, callback) {
        this.$http.post('autenticar', {key})
          .then(res => {
            if (res.data.success) {
              callback(res);

            } else {
              this.load = false;
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

    async mounted() {
      this.empresas = config.get('empresas') ? config.get('empresas') : [];
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

        // para nao deslogar nas versoes anteriores, excluir depois
        if (!this.empresas.length) {
          this.empresas.push({
            token: config.get('token'),
            key,
            isDefault: true
          });

          config.set('empresas', this.empresas)
        }
        // ------

        for (const e of this.empresas) {
          await this.autenticar(e.key, (res) => {
            if (e.isDefault) {
              this.$store.commit('setDataUser', res.data);
              const token = res.data.empresa;
              config.set("key", key);
              config.set("token", token);
              localStorage.setItem("key", key);
              localStorage.setItem("token", token);
            }

            e.nome_fantasia = res.data.dados.nome_fantasia;
            e.email = res.data.dados.email;
          });
        }

        config.set('empresas', this.empresas);
        this.load = false;

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
