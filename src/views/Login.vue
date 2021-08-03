<template>
  <div>
    <div style="padding-top: 20vh">
      <div class="text-center">
        <img src="../assets/logo-lecard.png" alt="" style="width: 70px">
        <h5 class="text-danger font-weight-bold mt-4">Gestor de Pedidos - Lecard</h5>
      </div>
      <div class="mt-4" style="width: 400px; margin: auto">
        <div>
          <div class="alert alert-danger alert-dismissible fade show text-center" role="alert" v-show="msg">
            {{msg}}
          </div>
          <form @submit.prevent="logar">
            <div>
              <input type="email" id="usuario" v-model="dados.email" class="form-control mb-3" placeholder="Usuário" minlength="4" required>
            </div>
            <div>
              <div class="form-control input-senha p-0 mb-3">
                <input type="password" id="inputSenha" v-model="dados.senha" placeholder="Senha"
                       minlength="6" required>
                <img src="../assets/icons/eye.svg" @click="mostrarSenha()" v-show="dados.senha.length > 0">
              </div>
            </div>
            <div class="form-group">
              <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" id="checkboxSenha" @change="salvarUser = !salvarUser" :checked="salvarUser">
                <label class="custom-control-label" for="checkboxSenha">Salvar Usuário</label>
              </div>
            </div>
            <button class="btn btn-danger btn-block" :disabled="loading">{{loading ? 'Aguarde' : 'Login'}}</button>
          </form>
          <div class="mt-5 text-center" v-show="$route.name === 'LoginAdd'">
            <router-link to="/empresas" class="text-danger">Voltar</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const {ipcRenderer} = require('electron');
  const Config = require('electron-config');
  const config = new Config();

  export default {
    name: 'Login',
    data() {
      return {
        token: '',
        msg: '',
        empresas: [],
        loading: false,
        salvarUser: true,
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
        this.loading = true;

        this.$http.post('autenticar', this.dados)
          .then(res => {
            if (res.data.success) {
              this.setToken(res.data);

            } else {
              localStorage.clear();
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

      setToken(data) {
        const key = data.token;
        const token = data.dados.token;

        this.empresas = config.get('empresas') ? config.get('empresas') : [];
        if (this.empresas.length) {
          if (this.empresas.find(e => e.token === token || e.key === key)) {
            this.loading = false;
            this.$swal('Você já está logado nesta empresa/e-mail, faça o login em outra conta ou volte ao menu principal.');
            return;
          }

          this.empresas.forEach(e => {
            e.isDefault = false
          });
        }

        this.empresas.push({
          token,
          key,
          isDefault: true
        });

        config.set("key", key);
        config.set("token", token);
        config.set('empresas', this.empresas);

        if (this.salvarUser) {
          config.set("email", this.dados.email);
        } else {
          config.delete("email");
        }

        this.$router.push("/pedidos");
        ipcRenderer.send('reload');

      }
    },

    mounted() {
      if (!config.get('key')) {
        config.set('empresas', []);
        this.loading = false;

        if (config.get("email")) {
          this.dados.email = config.get("email");
          this.salvarUser = true;

          setTimeout(() => {
            document.getElementById("inputSenha").focus()
          }, 500);
        }
      } else if (this.$route.name !== "LoginAdd") {
        this.$router.push('/pedidos');
      }
    }
  }
</script>
<style scoped>
  .input-senha {
    position: relative;
  }
  .input-senha input {
    border: none;
    display: block;
    width: 100%;
    height: 100%;
    padding: 0 10px;
  }
  .input-senha img {
    position: absolute;
    top: 8px;
    right: 10px;
    cursor: pointer;
    display: block;
    width: 20px;
  }
</style>
