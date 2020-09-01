<template>
  <div>
    <div class="p-5">
      <div class="text-center">
        <img src="../assets/logo-lecard.png" alt="" style="width: 100px">
        <h4 class="text-danger font-weight-bold mt-4">Gestor de Pedidos - Lecard</h4>
      </div>
      <div class="mt-4" style="width: 400px; margin: auto">
        <div>
          <div class="alert alert-danger alert-dismissible fade show text-center" role="alert" v-show="msg">
            {{msg}}
          </div>
          <form @submit.prevent="logar">
            <div>
              <input type="email" id="usuario" v-model="dados.email" class="form-control mb-3" placeholder="E-mail" minlength="4" required>
            </div>
            <div>
              <input type="password" id="inputSenha" v-model="dados.senha" class="form-control mb-3" placeholder="Senha" minlength="6" required>
            </div>
            <div class="form-group">
              <div class="custom-control custom-checkbox">
                  <input type="checkbox" class="custom-control-input" id="checkboxSenha" @change="mostrarSenha()">
                  <label class="custom-control-label" for="checkboxSenha">Exibir senha</label>
              </div>
            </div>
            <button class="btn btn-danger btn-block">{{loading ? 'Aguarde' : 'Login'}}</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');
const Config = require('electron-config');
const config = new Config();

export default {
  name: 'Login',
  data() {
    return {
      urlBase: '',
      token: '',
      msg: '',
      loading: false,
      dados: {
        email: '',
        senha: ''
      }
    }
  },
  methods: {
    mostrarSenha() {
      const input = document.getElementById("inputSenha");
      if (input.type === "password") {
        input.type = "text";
      } else {
        input.type = "password";
      }
    },

    logar() {
      this.$http.post(this.urlBase + 'autenticar', this.dados)
        .then(res => {
          this.loading = false;

          if (res.data.success) {
            const socket = res.data.dados.base_socket;
            localStorage.setItem("urlSocket", socket);
            config.set('urlSocket', socket);
            config.set('userData', res.data);
            config.set('empresa', res.data.dados.token);
            this.setUserData(res.data);

            if (localStorage.getItem('urlSocket')) {
              this.$router.push("/home");
            } else {
              this.$router.push("/configs");
            }

            ipcRenderer.send('reloud');
          }

        }, res => {
          console.log(res);
          this.loading = false;
          let msg = res.data.msg;

          if (res.status === 401) {
            this.msg = msg;
            this.dados.senha = '';
          } else {
            alert(msg ? msg : 'Erro temporário');
          }
        });
    },

    setUserData(data) {
      localStorage.setItem("key", data.token);
      localStorage.setItem("empresa", data.dados.token);
      localStorage.setItem("nome_fantasia", data.dados.nome_fantasia);
      localStorage.setItem("nome_usuario", data.dados.nome);
      localStorage.setItem("administrativo", false);
      if (data.dados.id_funcao === '1') {
        localStorage.setItem("administrativo", true);
      }
    }

  },

  created() {
    this.urlBase = config.get('urlBase');
    localStorage.setItem('urlBase', this.urlBase);

    if (config.get('empresa')) {
      localStorage.setItem('empresa', config.get('empresa'));

      this.token = config.get('empresa');

      if (config.get('userData')) {
        localStorage.setItem('userData', config.get('userData'));
        this.setUserData(config.get('userData'));

        if (localStorage.getItem('urlSocket')) {
          this.$router.push("/home");
        } else {
          this.$router.push("/configs");
        }
      }
    }

    if (config.get('urlSocket') && !localStorage.getItem('urlSocket')) {
      localStorage.setItem('urlSocket', config.get('urlSocket'));
    }
  }
}
</script>
