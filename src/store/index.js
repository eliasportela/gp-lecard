import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    dataUser: {
      token: '',
      nome_usuario: '',
      nome_fantasia: ''
    }
  },
  mutations: {
    setDataUser: (state, data) => {
      state.dataUser = {
        empresa: data.dados.token,
        nome_usuario: data.dados.nome,
        nome_fantasia: data.dados.nome_fantasia
      };

      localStorage.setItem('key', data.token)
    }
  },
  actions: {
  },
  modules: {
  }
})
