<template>
  <div>
    <div class="fixed-top p-2 shadow-sm bg-white">
      <div class="container-fluid">
        <div class="row">
          <div class="col-5 align-self-center">
            <router-link to="/home" class="text-dark">
              <img src="../assets/logo-lecard.png" alt="" style="width: 32px" id="imgEmpresa">
              <span class="font-weight-bold small pl-3">{{dados.nome_fantasia}}</span>
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
              <a href="javascript:" class="pr-3" title="Clique para silenciar o toque! =)" @click="silenciar">
                <img class="d-inline-block" :class="{'animated pulse infinite': bell}" src="../assets/icons/notification.svg" style="width: 24px"/>
              </a>
              <a href="javascript:" @click="reloadPage" class="small" style="text-decoration: none">
                <span class="font-weight-bold text-success" v-show="connected">Você está online</span>
                <span class="font-weight-bold text-danger" v-show="!connected">Você está offline</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="menu-lateral bg-dark">
      <router-link to="/pedidos" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/orders.svg" alt="">
        <span>Pedidos</span>
      </router-link>
      <router-link to="/cardapio" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/food-menu.svg" alt="">
        <span>Cardápio</span>
      </router-link>
      <router-link to="/impressora" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/print.svg" alt="">
        <span>Configs</span>
      </router-link>
      <a :href="'https://portal.lecard.delivery/'" target="_blank" class="btn btn-block">
        <img src="../assets/icons/report.svg" alt="">
        <span>Portal</span>
      </a>
      <a class="btn btn-block" @click="logout">
        <img src="../assets/icons/logout.svg" alt="">
        <span>Sair</span>
      </a>
    </div>

    <imprimir/>

    <modal :opened="modalOflline">
      <h5 class="text-center">Atenção!</h5>
      <div>Seus pedidos não estão sendo sincronizados. Por favor verifique sua conexão com a internet!</div>
      <div class="text-center mt-4">
        <button class="btn btn-danger" @click="reloadPage">OK</button>
      </div>
    </modal>
  </div>
</template>

<script>
const Config = require('electron-config');
const { ipcRenderer } = require('electron');
const config = new Config();
import Imprimir from "./Imprimir";
import Modal from '../components/Modal'

export default {
  name: 'TopBar',
  components: {Imprimir, Modal},
  props: {
    msg: String,
  },
  data() {
    return {
      token: localStorage.getItem('key'),
      empresa: {
        status: 1,
        agendamento: 1,
      },
      load: true,
      empresaAtiva: false,
      connected: false,
      modalOflline: false,
      bell: false
    }
  },

  methods: {
    silenciar() {
      audio.pause();
      this.bell = false;
      ipcRenderer.send('reloud-icon', false);
    },

    logout() {
      this.$swal({
        text: "Deseja sair do sistema?",
        confirmButtonText: 'Sim',
        cancelButtonText: "Cancelar",
        showCancelButton: true,
        customClass: {
          cancelButton: 'btn btn-danger ml-3',
          confirmButton: 'btn btn-success '
        },
        buttonsStyling: false
      }).then((result) => {
        if (result.value) {
          this.logoff()
        }
      });
    },

    logoff() {
      this.silenciar();
      config.delete('key');
      config.delete('empresa');
      localStorage.clear();
      if (this.$route.name !== 'Login') {
        this.$router.push("/")
      }
    },

    statusEmpresa() {
      if (localStorage.getItem('token')) {
        this.$http.get('delivery/empresa/status/' + localStorage.getItem('token'))
          .then(response => {
            this.empresa.status = parseInt(response.data.status);
            this.empresa.agendamento = parseInt(response.data.agendamento);
            this.load = false;

            if (this.empresa.status === 0 && this.empresa.agendamento === 0 && !sessionStorage.getItem('delivery_desativado')){
              this.$emit('delivery_desativado');
              new Notification('LeCard - Gestor de Pedidos', {
                body: 'Seu delivery está desativado, seus pedidos não serão aceitos!',
                icon: document.getElementById('imgEmpresa').src
              });

              sessionStorage.setItem('delivery_desativado', 'true');
            }

          }, res => {
            console.log(res);
          });
      }
    },

    toogleStatus() {
      let dados = {
        status: this.empresa.status === 1 ? 0 : 1
      };

      this.empresa.status = dados.status;
      this.$http.post('delivery/empresa/status/' + this.token, dados)
        .then(response => {

        }, res => {
          console.log(res);
          this.empresa.status = dados.status === 1 ? 0 : 1;
          this.$swal('', res.data.msg ? res.data.msg : 'Erro temporário');
        });
    },

    reloadPage() {
      // this.dialogNotify()
      ipcRenderer.send('reloud');
    },

    dialogNotify() {
      new Notification('LeCard - Gestor de Pedidos', {
        body: 'Tem pedido novo na área <3',
        icon: document.getElementById('imgEmpresa').src
      })
    },
  },

  computed: {
    dados() {
      return this.$store.state.dataUser
    }
  },

  sockets: {
    connect() {
      this.connected = true;
      this.modalOflline = false;
      this.$emit('delivery_order');
    },

    disconnect() {
      this.modalOflline = true;
      this.connected = false;
    },

    notification(res)  {
      if (res.play) {
        this.dialogNotify()
        audio.play();
        this.bell = true;
        ipcRenderer.send('reloud-icon', true);

      } else if (!audio.paused) {
        audio.pause();
        ipcRenderer.send('reloud-icon', false);
        this.bell = false;
      }
    },

    delivery_order() {
      this.$emit('delivery_order');
    }
  },

  mounted() {
    this.statusEmpresa();
    this.connected = this.$socket ? this.$socket.connected : false;
  },

  created() {
    this.$parent.$on('notification', () => {
      this.bell = false;
      ipcRenderer.send('reloud-icon', false);
      if (!audio.paused) {
        audio.pause();
      }
    });

    this.$parent.$on('logout', () => {
      this.logoff();
    });

    this.$parent.$on('silenciar', () => {
      this.silenciar();
    });

    this.$parent.$on('ativarDelivery', () => {
      this.toogleStatus();
    });
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
