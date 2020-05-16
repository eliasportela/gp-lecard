<template>
  <div>
    <div class="text-center p-5">
      <img src="../assets/logo-lecard.png" alt="" style="width: 100px">
      <h4 class="text-danger font-weight-bold mt-4">Gestor de Pedidos - Lecard</h4>
      <div class="mt-4" style="width: 400px; margin: auto">
        <div v-show="container === 1">
          <form @submit.prevent="setToken">
            <div class="mb-3">Informe o token de acesso da sua empresa</div>
            <input type="text" class="form-control mb-3" v-model="token" minlength="6" placeholder="Token da sua empresa">
            <button class="btn btn-danger btn-block">Próximo</button>
          </form>
        </div>
        <div v-show="container === 2">
          <div class="alert alert-danger alert-dismissible fade show" role="alert" v-show="msg">
            {{msg}}
          </div>
          <form @submit.prevent="logar()">
            <input type="text" v-model="dados.usuario" class="form-control mb-3" placeholder="Usuário" minlength="4" required>
            <input type="password" v-model="dados.senha" class="form-control mb-3" placeholder="Senha" minlength="6" required>
            <button class="btn btn-danger btn-block">{{loading ? 'Aguarde' : 'Login'}}</button>
          </form>
          <div class="mt-5">
            <a href="javascript:" @click="container = 1">Mudar empresa</a>
          </div>
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
      container: 1,
      token: '',
      msg: '',
      loading: false,
      dados: {
        usuario: '',
        senha: ''
      }
    }
  },
  methods: {
    setToken() {
      config.set('empresa', this.token);
      localStorage.setItem('empresa', this.token);
      this.container = 2;
    },

    logar() {
      this.loading = true;

      let parametro = "?empresa=" + this.token;
      this.$http.post(this.urlBase + 'autenticar' + parametro, this.dados)
        .then(res => {

          // console.log(res);
          if (res.data.success) {
            config.set('userData', res.data);
            this.setUserData(res.data);

            setTimeout(() => {
              if (localStorage.getItem('urlSocket')) {
                this.$router.push("/home");
              } else {
                this.$router.push("/configs");
              }
            },500);

          } else {
            this.loading = false;
          }

        }, res => {
          console.log(res);
          if (res.status === 401) {
            this.msg = res.data.msg;
            this.dados.senha = '';
          } else {
            alert(this.msg ? this.msg : 'Erro temporário');
          }
          this.loading = false;
        });
    },

    setUserData(data) {
      localStorage.setItem("key", data.dados.token);
      localStorage.setItem("nome_fantasia", data.dados.nome_fantasia);
      localStorage.setItem("nome_usuario", data.dados.nome);
      localStorage.setItem("plano_empresa", data.dados.plano_empresa);
      localStorage.setItem("administrativo", false);
      if (data.dados.id_funcao === '1') {
        localStorage.setItem("administrativo", true);
      }
      localStorage.setItem("permissoes", JSON.stringify(data.permissoes));
    },

    test() {
      let Data = {
        message: "Hi",
        someData: "Let's go"
      };

      ipcRenderer.send('request-mainprocess-action', Data);
    }
  },

  created() {
    this.urlBase = config.get('urlBase');
    localStorage.setItem('urlBase', this.urlBase);

    if (config.get('empresa')) {
      localStorage.setItem('empresa', config.get('empresa'));

      this.container = 2;
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
