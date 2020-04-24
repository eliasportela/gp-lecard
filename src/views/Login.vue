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

export default {
  name: 'Login',
  data() {
    return {
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
      localStorage.setItem('empresa', this.token);
      this.container = 2;
    },

    logar() {
      this.loading = true;

      let parametro = "?empresa=" + this.token;
      this.$http.post('autenticar' + parametro, this.dados)
        .then(res => {

          if (res.data.success) {

            localStorage.setItem("key", res.data.dados.token);
            localStorage.setItem("nome_fantasia", res.data.dados.nome_fantasia);
            localStorage.setItem("nome_usuario", res.data.dados.nome);
            localStorage.setItem("plano_empresa", res.data.dados.plano_empresa);
            localStorage.setItem("administrativo", false);

            if (res.data.dados.id_funcao === '1') {
              localStorage.setItem("administrativo", true);
            }
            localStorage.setItem("permissoes", JSON.stringify(res.data.permissoes));

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
            alert(this.dados.senha ? 'this.dados.senha' : 'Erro temporário');
          }
          this.loading = false;
        });
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
    if (localStorage.getItem('empresa')) {
      this.container = 2;
      this.token = localStorage.getItem('empresa');

      if (localStorage.getItem('key')) {
        this.$router.push('/home');
      }
    }
  }
}
</script>
