<template>
  <div>
    <div class="fixed-top p-2 shadow-sm bg-white">
      <div class="float-right pr-2 pt-2 text-right">
        <router-link to="/configs" class="small" style="text-decoration: none">
          <div class="font-weight-bold text-success" v-show="connected">Você está online</div>
          <div class="font-weight-bold text-danger" v-show="!connected">Você está offline</div>
        </router-link>
      </div>
      <a href="javascript:" class="float-right pr-3 animated infinite pulse" style="padding-top: 2px" v-show="bell" @click="silenciar">
        <img src="../assets/icons/notification.svg" style="width: 24px"/>
      </a>
      <div class="pt-1 pl-2">
        <router-link to="/" class="text-dark">
          <img src="../assets/logo-lecard.png" alt="" style="width: 32px">
          <span class="font-weight-bold small pl-3">{{empresa.nome}}</span>
        </router-link>
        <!--<button @click="teste">Teste</button>-->
      </div>
    </div>
    <div class="menu-lateral bg-dark">
      <router-link to="/pedidos" active-class="btn--active" class="btn btn-block">
        <!--animated infinite pulse-->
        <img src="../assets/icons/orders.svg" alt="">
        <span>Pedidos</span>
      </router-link>
      <router-link to="/impressora" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/print.svg" alt="">
        <span>Impressora</span>
      </router-link>
      <router-link to="/configs" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/settings.svg" alt="">
        <span>Configs.</span>
      </router-link>
    </div>

    <imprimir-comanda/>

  </div>
</template>

<script>
import io from 'socket.io-client';
import ImprimirComanda from "./ImprimirComanda";

export default {
  name: 'TopBar',
  components: {ImprimirComanda},
  props: {
    msg: String,
  },
  data() {
    return {
      empresa: {
        token: localStorage.getItem('empresa'),
        nome: localStorage.getItem('nome_fantasia')
      },
      socket: '',
      connected: false,
      bell: false
    }
  },

  methods: {
    print(data) {
      this.$emit('print-venda', data)
    },

    silenciar() {
      audio.pause();
      this.bell = false;
      if (this.$route.name !== 'Pedidos') {
        this.$router.push('/pedidos');
      }
    }
  },

  created() {
    if (localStorage.getItem('urlSocket')) {
      this.socket = io(localStorage.getItem('urlSocket') + localStorage.getItem('empresa'));
      this.connected = false;

      this.socket.on('connect', () => {
        this.connected = true
      });

      this.socket.on('disconnect', () => {
        this.connected = false
      });

      this.socket.on('print_order', (res) => {
        this.print(res.data);
      });

      this.socket.on('notification', (res) => {
        // console.log('elias', res);
        if (res.data.play && !this.bell && audio.paused) {
          audio.play();
          this.bell = true;

        } else if (this.bell && !audio.paused) {
          audio.pause();
          this.bell = false;
          this.$emit('delivery_order');
        }
      });

      this.socket.on('delivery_order', () => {
        this.$emit('delivery_order');
      });

      this.$parent.$on('delivery_status', (data) => {
        this.socket.emit('delivery_status', data);
      });

      this.$parent.$on('notification', () => {
        audio.pause();
        this.bell = false;
        this.socket.emit('notification', {token: this.empresa.token, play: false});
      });
    }
  }
}
</script>

<style scoped>
  .menu-lateral {
    position: fixed;
    height: 100%;
    width: 70px;
    z-index: 1;
    top: 0;
    left: 0;
    overflow-x: hidden;
    padding: 65px 8px 0;
  }
  .menu-lateral img {
    width: 24px;
  }
  .menu-lateral span {
    margin-top: 6px;
    display: block;
    font-weight: 600;
  }
  .menu-lateral .btn {
    padding: 8px 0;
    color: #ffffff;
    font-size: 10px;
  }
  .menu-lateral .btn--active {
    background-color: rgba(255,255,255,0.1);
  }
</style>
