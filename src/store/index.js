import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    dataUser: {
      token: '',
      empresa: '',
      nome_usuario: '',
      nome_fantasia: '',
      id_funcao: '',
      site: '',
      master: ''
    },

    bell: {
      status: false
    },

    empresas: [],
    modalOflline: false
  },

  mutations: {
    setDataUser: (state, data) => {
      state.dataUser = {
        empresa: data.dados.token,
        nome_usuario: data.dados.nome,
        nome_fantasia: data.dados.nome_fantasia,
        id_funcao: data.dados.id_funcao,
        id_plano: data.dados.id_plano,
        site: data.dados.site,
        master: data.dados.master,
        email: data.dados.email,
        lat_empresa: data.dados.lat_empresa,
        long_empresa: data.dados.long_empresa
      };
    },

    logout(state) {
      state.dataUser = {
        token: '',
        nome_usuario: '',
        nome_fantasia: '',
        site: '',
      };
      localStorage.clear();
    },

    setBell(state, data) {
      state.bell = {
        status: data
      }
    }
  },
  actions: {
  },
  modules: {
  }
})
