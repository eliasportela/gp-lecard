<template>
  <div>
    <div class="text-center p-5">
      <img src="../assets/logo-lecard.png" alt="" style="width: 100px">
      <h4 class="text-danger font-weight-bold mt-4">Gestor de Pedidos - Lecard</h4>
      <div class="mt-4" style="width: 400px; margin: auto">
        <div v-show="container === 1">
          <form @submit.prevent="getEmpresa">
            <div class="alert alert-danger alert-dismissible fade show" role="alert" v-show="msg">
              {{msg}}
            </div>
            <div class="mb-3">Informe o domínio de acesso da sua empresa</div>
            <input type="text" class="form-control mb-3" v-model="dominio" minlength="6" placeholder="Dominio da sua empresa">
            <button class="btn btn-danger btn-block">{{loading ? 'Validando o domínio' : 'Próximo'}}</button>
          </form>
        </div>
        <div v-show="container === 2">
          <div class="alert alert-danger alert-dismissible fade show" role="alert" v-show="msg">
            {{msg}}
          </div>
          <form @submit.prevent="logar">
            <input type="text" id="usuario" v-model="dados.usuario" class="form-control mb-3" placeholder="Usuário" minlength="4" required>
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
      socket: '',
      dominio: '',
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
    getEmpresa() {
      this.loading = true;
      this.$http.get(this.urlBase + 'autenticar/' + this.dominio)
        .then(res => {
          this.loading = false;
          this.token = res.data.token;
          this.socket = res.data.base_socket + this.token;

          config.set('empresa', this.token);
          localStorage.setItem('empresa', this.token);
          this.container = 2;
          this.msg = '';

          setTimeout(() => {
            document.getElementById('usuario').focus();
          }, 500);

        }, res => {
          this.loading = false;
          this.msg = res.data.msg ? res.data.msg : 'Erro temporário';
        });
    },

    logar() {
      let parametro = "?empresa=" + this.token;
      this.loading = true;

      this.$http.post(this.urlBase + 'autenticar' + parametro, this.dados)
        .then(res => {
          this.loading = false;

          if (res.data.success) {
            if (res.data.dados.id_funcao !== '1' && (res.data.permissoes && !res.data.permissoes.includes('6'))) {
              this.msg = "Usuário sem acesso ao Gestor de Pedidos!";
              return;
            }

            config.set('dominio', this.dominio);
            localStorage.setItem("dominio", this.dominio);

            config.set('urlSocket', this.socket);
            localStorage.setItem("urlSocket", this.socket);

            config.set('userData', res.data);
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
      localStorage.setItem("key", data.dados.token);
      localStorage.setItem("nome_fantasia", data.dados.nome_fantasia);
      localStorage.setItem("nome_usuario", data.dados.nome);
      localStorage.setItem("plano_empresa", data.dados.plano_empresa);
      localStorage.setItem("administrativo", false);
      if (data.dados.id_funcao === '1') {
        localStorage.setItem("administrativo", true);
      }
      localStorage.setItem("permissoes", JSON.stringify(data.permissoes));
    }

  },

  created() {
    this.urlBase = config.get('urlBase');
    localStorage.setItem('urlBase', this.urlBase);

    if (config.get('empresa')) {
      localStorage.setItem('empresa', config.get('empresa'));

      this.token = config.get('empresa');
      this.dominio = config.get('dominio');

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

    if (config.get('dominio') && !localStorage.getItem('dominio')) {
      localStorage.setItem('dominio', config.get('dominio'));
    }
  }
}
</script>
