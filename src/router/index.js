import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Pedidos from '../views/Pedidos.vue'
import Impressora from '../views/Impressora.vue'
import Login from '../views/Login.vue'
import Configs from '../views/Configs.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/pedidos',
    name: 'Pedidos',
    component: Pedidos
  },
  {
    path: '/impressora',
    name: 'Impressora',
    component: Impressora
  },
  {
    path: '/configs',
    name: 'Configs',
    component: Configs
  },
];

const router = new VueRouter({
  routes
});

export default router
