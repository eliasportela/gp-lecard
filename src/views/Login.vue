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
      token: '',
      msg: '',
      loading: true,
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
      this.$http.post('autenticar', this.dados)
        .then(res => {
          this.loading = false;
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
    }
  },

  mounted() {
    if (!localStorage.getItem('key')) {
      this.loading = false;
    }
  }
}
</script>
