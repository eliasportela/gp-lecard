<template>
  <div>
    <div class="fixed-top p-2 shadow-sm bg-white">
      <div class="container-fluid">
        <div class="row">
          <div class="col-5 align-self-center">
            <router-link to="/" class="text-dark">
              <img src="../assets/logo-lecard.png" alt="" style="width: 32px">
              <span class="font-weight-bold small pl-3">{{empresa.nome}}</span>
            </router-link>
          </div>
          <div class="col-4 align-self-center">
            <div class="text-center" v-show="!load">
              <a class="small text-danger font-weight-bold" href="javascript:" v-show="empresa.status === 1" @click="toogleStatus()">
                <span class="pr-2">Desativar delivery</span>
                <img src="../assets/icons/switch-on.svg" style="width: 32px">
              </a>
              <a class="small font-weight-bold text-dark" title="Clique para ativar o delivery" href="#" v-show="empresa.status === 0" @click="toogleStatus()">
                <span class="pr-2">Ativar delivery</span>
                <img src="../assets/icons/switch-off.svg" style="width: 32px">
              </a>
            </div>
          </div>
          <div class="col-3 text-right align-self-center">
            <div>
              <a href="javascript:" class="pr-3" title="Tem pedido na área! =)" @click="silenciar">
                <img class="d-inline-block" :class="{'animated pulse infinite': bell}" src="../assets/icons/notification.svg" style="width: 24px"/>
              </a>
              <router-link to="/configs" class="small" style="text-decoration: none">
                <span class="font-weight-bold text-success" v-show="connected">Você está online</span>
                <span class="font-weight-bold text-danger" v-show="!connected">Você está offline</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="menu-lateral bg-dark">
      <router-link to="/pedidos" active-class="btn--active" class="btn btn-block">
        <!--animated infinite pulse-->
        <img src="../assets/icons/orders.svg" alt="">
        <span>Pedidos</span>
      </router-link>
      <router-link to="/cardapio" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/food-menu.svg" alt="">
        <span>Cardápio</span>
      </router-link>
      <router-link to="/impressora" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/print.svg" alt="">
        <span>Impressora</span>
      </router-link>
      <router-link to="/configs" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/settings.svg" alt="">
        <span>Configs.</span>
      </router-link>
      <a class="btn btn-block" @click="logout">
        <img src="../assets/icons/logout.svg" alt="">
        <span>Logout</span>
      </a>
    </div>

    <imprimir-comanda/>

  </div>
</template>

<script>
const Config = require('electron-config');
const config = new Config();
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
      token: localStorage.getItem('key'),
      urlBase: localStorage.getItem('urlBase'),
      empresa: {
        token: localStorage.getItem('empresa'),
        nome: localStorage.getItem('nome_fantasia'),
        status: 1,
      },
      load: true,
      empresaAtiva: false,
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
    },

    logout() {
      this.$swal({
        text: "Confirma o logout do sistema?",
        showCancelButton: true,
        customClass: {
          cancelButton: 'btn btn-danger ml-3',
          confirmButton: 'btn btn-success '
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {
          localStorage.clear();
          config.delete('userData');
          this.$router.push('/');
        }
      });
    },

    statusEmpresa() {
      this.$http.get(this.urlBase + 'delivery/empresa/status/' + this.empresa.token)
        .then(response => {
          this.empresa.status = parseInt(response.data.status);
          this.load = false;

          if (this.empresa.status === 0){
            this.$emit('delivery_desativado');
          }

        }, res => {
          console.log(res);
        });
    },

    toogleStatus() {
      let dados = {
        status: this.empresa.status === 1 ? 0 : 1
      };

      this.empresa.status = dados.status;
      this.$http.post(this.urlBase + 'delivery/empresa/status/' + this.token, dados)
        .then(response => {
          // console.log(response)
          // this.empresa.status = parseInt(response.data.status);
          // let msg = 'Sucesso! ' + (this.empresa.status === 1 ? 'Seu delivery está ativado agora.' : 'Seu delivery está desativado.');
          // this.$swal('', msg);

        }, res => {
          console.log(res);
          this.empresa.status = dados.status === 1 ? 0 : 1;
          this.$swal('', res.data.msg ? res.data.msg : 'Erro temporário');
        });
    }
  },

  mounted() {
    if (!audio.paused) {
      audio.pause();
    }
    this.statusEmpresa();
  },

  created() {
    if (localStorage.getItem('urlSocket') && localStorage.getItem('urlSocket').length > 5) {
      this.socket = io(localStorage.getItem('urlSocket') + localStorage.getItem('empresa'));
      this.connected = false;
      // console.log(this.socket);

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
