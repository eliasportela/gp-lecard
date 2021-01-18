import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Empresas from '../views/Empresas.vue'
import Pedidos from '../views/Pedidos.vue'
import Configs from '../views/Configs.vue'
import Login from '../views/Login.vue'
import Cardapio from '../views/Cardapio.vue'
import Vantagens from '../views/Vantagens.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/add-login',
    name: 'LoginAdd',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/empresas',
    name: 'Empresas',
    component: Empresas
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    component: Pedidos
  },
  {
    path: '/impressora',
    name: 'Impressora',
    component: Configs
  },
  {
    path: '/cardapio',
    name: 'Cardapio',
    component: Cardapio
  },
  {
    path: '/vantagens',
    name: 'Vantagens',
    component: Vantagens
  }
];

const router = new VueRouter({
  routes
});

export default router
