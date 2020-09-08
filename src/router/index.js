import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Pedidos from '../views/Pedidos.vue'
import Configs from '../views/Configs.vue'
import Login from '../views/Login.vue'
import Cardapio from '../views/Cardapio.vue'
import Whatsapp from '../views/Whatsapp.vue'

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
    component: Configs
  },
  {
    path: '/cardapio',
    name: 'Cardapio',
    component: Cardapio
  },
  {
    path: '/whatsapp',
    name: 'Whatsapp',
    component: Whatsapp
  }
];

const router = new VueRouter({
  routes
});

export default router
