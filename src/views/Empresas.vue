<template>
  <div>
    <div class="content">
      <div class="border p-5" style="max-width: 500px; margin: auto">
        <div class="text-center mb-4">
          <img src="../assets/logo-lecard.png" alt="Logo Lecard" style="width: 60px">
          <h4 class="mt-2">Escolha uma conta</h4>
        </div>
        <div v-for="e in empresas">
          <div class="d-flex justify-content-between align-items-center border-top py-2">
            <a href="javascript:" class="d-block text-decoration-none text-dark" @click="logarConta(e)">
              <h6 class="font-weight-bold m-0">
                {{e.nome_fantasia}}
                <small class="text-muted" v-if="e.token === token">(Default)</small>
              </h6>
              <small class="text-muted">{{e.email}}</small>
            </a>
            <button class="btn btn-outline-dark btn-sm" @click="removerEmpresa(e)" v-if="empresas.length > 1">Remover</button>
          </div>
        </div>
        <router-link to="/add-login" href="javascript:" class="d-block border-top py-2 text-decoration-none text-danger">
          <h6 class="font-weight-bold m-0">Adicionar nova conta</h6>
          <small class="text-muted">Clique para adicionar uma nova conta</small>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
const {ipcRenderer} = require('electron');
const Config = require('electron-config');
const config = new Config();
import TopBar from '@/components/TopBar.vue'

export default {
  name: 'Empresas',
  components: {
    TopBar
  },
  data() {
    return {
      token: "",
      empresas: [],
      load: false
    }
  },
  methods: {
    logarConta(empresa) {
      if (this.load) {
        return;
      }

      this.load = true;
      this.empresas.forEach(e => {
        e.isDefault = false
      });

      empresa.isDefault = true;
      config.set('empresas', this.empresas);

      this.$router.push("/home");
      ipcRenderer.send('reload');
    },

    removerEmpresa(e) {
      this.empresas = this.empresas.filter(el => el !== e);
      config.set("empresas", this.empresas);

      if (e.isDefault) {
        this.logarConta(this.empresas[0]);
      }
    }
  },
  created() {
    this.token = localStorage.getItem('token');
    this.empresas = config.get('empresas') ? config.get('empresas') : [];
  }
}
</script>
