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
              <input type="email" id="usuario" v-model="dados.email" class="form-control mb-3" placeholder="E-mail"
                     minlength="4" required>
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
        loading: true,
        salvarUser: false,
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
            localStorage.clear();

            if (res.data.success) {
              this.setToken(res.data);
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

      setToken(data) {
        const key = data.token;
        const token = data.dados.token;
        config.set("key", key);
        config.set("token", token);
        localStorage.setItem("key", key);
        localStorage.setItem("token", token);

        if (this.salvarUser) {
          config.set("email", this.dados.email);
        } else {
          config.delete("email");
        }
      }
    },

    mounted() {
      if (!localStorage.getItem('key')) {
        this.loading = false;

        if (config.get("email")) {
          this.dados.email = config.get("email");
          this.salvarUser = true;

          setTimeout(() => {
            document.getElementById("inputSenha").focus()
          }, 500)
        }
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
