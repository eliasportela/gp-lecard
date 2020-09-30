import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dataUser: {
      token: '',
      empresa: '',
      nome_usuario: '',
      nome_fantasia: '',
      id_funcao: '',
      site: '',
    }
  },
  mutations: {
    setDataUser: (state, data) => {
      state.dataUser = {
        empresa: data.dados.token,
        nome_usuario: data.dados.nome,
        nome_fantasia: data.dados.nome_fantasia,
        id_funcao: data.dados.id_funcao,
        site: data.dados.site
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
    }
  },
  actions: {
  },
  modules: {
  }
})
