<template>
  <div>
    <div class="fixed-top shadow-sm bg-white">
      <div class="container-fluid">
        <div class="row py-1 align-items-center">
          <div class="col-5">
            <router-link to="/empresas" class="text-dark">
              <img src="../assets/logo-lecard.png" alt="" style="width: 32px" id="imgEmpresa">
              <span class="font-weight-bold small pl-3">{{dados.nome_fantasia}} {{homologacao ? '(Teste)' : ''}}</span>
            </router-link>
          </div>
          <div class="col-7 d-flex justify-content-end align-items-center">
            <div class="mr-3" v-if="bell">
              <button class="btn btn-outline-danger" @click="silenciar">
                Silenciar
              </button>
            </div>
            <button class="btn mr-3" :class="empresa.ativo === '1' ? 'btn-danger' : 'btn-dark'" @click="toogleStatus()" :disabled="load">
              {{empresa.ativo === '1' ? 'Desativar agora' : 'Ativar Loja'}}
            </button>
            <div class="border rounded p-1 px-2" @click="reloadPage" style="width: 250px; height: 50px">
              <div v-show="!load">
                <h6 class="m-0 text-danger" v-if="!connected">Você está offline</h6>
                <h6 class="m-0 text-success" v-else-if="empresa.ativo === '1' && empresa.aberto === '1'">Loja Aberta</h6>
                <h6 class="m-0 text-warning" v-else-if="empresa.ativo === '1' && empresa.entregas.length">Loja Fechada</h6>
                <h6 class="m-0 text-dark" v-else>{{empresa.ativo === '1' ? 'Loja Fechada' : 'Loja Desativada'}}</h6>
                <div class="small">
                  <span v-if="!connected">Verifique sua coneção com a internet</span>
                  <span v-else-if="empresa.ativo === '1' && empresa.aberto === '1'">Dentro do horário de expediente</span>
                  <span v-else-if="empresa.ativo === '1' && empresa.entregas.length">Aceitando apenas pedidos agendados</span>
                  <span v-else>{{empresa.ativo === '1' ? 'Fora do horário de expediente' : 'Ative a loja para receber pedidos'}}</span>
                </div>
              </div>
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
      <router-link to="/vantagens" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/vantagens.svg" alt="">
        <span>Vantagens</span>
      </router-link>
      <div style="bottom: 8px; left: 8px; right: 8px; position: absolute">
        <a :href="'https://portal.lecard.delivery/'" target="_blank" class="btn btn-block">
          <img src="../assets/icons/report.svg" alt="">
          <span>Portal</span>
        </a>
        <router-link to="/impressora" active-class="btn--active" class="btn btn-block">
          <img src="../assets/icons/settings.svg" alt="">
          <span>Configs</span>
        </router-link>
      </div>
      <!--<a href="javascript:" @click="autoAtendimento" class="btn btn-block">-->
        <!--<img src="../assets/icons/pos.svg" alt="">-->
        <!--<span>Totem</span>-->
      <!--</a>-->
    </div>

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
import Modal from '../components/Modal'

export default {
  name: 'TopBar',
  components: {Modal},
  props: {
    msg: String,
  },
  data() {
    return {
      base_server: process.env.VUE_APP_BASE_SERVER,
      token: localStorage.getItem('key'),
      empresa: {
        ativo: '1',
        status: '1',
        aberto: '0',
        entregas: [],
      },
      load: true,
      empresaAtiva: false,
      connected: false,
      modalOflline: false,
      bell: false,
      notification: '',
      homologacao: config.get('base_server')
    }
  },

  methods: {
    silenciar() {
      audio.pause();
      this.bell = false;
      ipcRenderer.send('reloud-icon', false);
    },

    statusEmpresa() {
      if (localStorage.getItem('token')) {
        this.$http.get(this.base_server + 'delivery/' + localStorage.getItem('token') + '/empresa/status/')
          .then(response => {
            this.empresa = response.data;

            if (this.empresa.ativo === '0' && !sessionStorage.getItem('delivery_desativado')){
              this.$emit('delivery_desativado');
              setTimeout(() => {
                if (this.empresa.ativo === '0') {
                  new Notification('LeCard - Gestor de Pedidos', {
                    body: 'Seu delivery está desativado, seus pedidos não serão aceitos!',
                    icon: document.getElementById('imgEmpresa').src
                  });
                }
              }, 60000);

              sessionStorage.setItem('delivery_desativado', 'true');
            }

            this.load = false;

          }, res => {
            console.log(res);
          });
      }
    },

    toogleStatus() {
      if (this.load) {
        return;
      }

      if (this.empresa.ativo === '1') {
        this.$swal({
          icon: 'warning',
          title: 'Atenção!',
          text: "Ao desativar sua loja seus clientes não poderão realizar mais pedidos ao menos que você ative novamente a empresa. Deseja realmente desativar?",
          confirmButtonText: 'Sim',
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          customClass: {
            cancelButton: 'btn btn-danger w-25 m-2',
            confirmButton: 'btn btn-primary w-25 m-2'
          },
          buttonsStyling: false
        }).then((result) => {
          if (result.value) {
            this.changeStatus();
          }
        });

      } else {
        this.changeStatus();
      }
    },

    changeStatus() {
      this.load = true;
      const dados = { status: this.empresa.ativo === '1' ? '0' : '1' };
      this.$http.post('delivery/empresa/status/' + this.token, dados)
        .then(response => {
          this.statusEmpresa();

        }, res => {
          console.log(res);
          this.empresa.ativo = dados.status === '1' ? '0' : '1';
          this.$swal('', res.data.msg ? res.data.msg : 'Erro temporário');
        });
    },

    reloadPage() {
      // this.dialogNotify()
      ipcRenderer.send('reload');
    },

    dialogNotify(empresa) {
      this.notification = new Notification(empresa ? ('LeCard - ' + empresa) : 'LeCard - Gestor de Pedidos', {
        body: 'Tem pedido novo na área ❤️',
        icon: document.getElementById('imgEmpresa').src
      });

      this.notification.onclick = (event) => {
        event.preventDefault();
        ipcRenderer.send('focus');

        if (this.$route.name !== 'Pedidos') {
          this.$router.push('/pedidos');
        }
      };
    },

    autoAtendimento() {
      ipcRenderer.send('autoatendimento');
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
      this.$emit('delivery_order', true);
    },

    disconnect() {
      this.modalOflline = true;
      this.connected = false;
    },

    notification(res)  {
      if (res.play) {
        this.dialogNotify(res.nome_fantasia);
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
      this.$emit('delivery_order', true);
    }
  },

  mounted() {
    this.statusEmpresa();
    this.connected = this.$socket ? this.$socket.connected : false;
  },

  created() {
    this.$parent.$on('playNotification', () => {
      if (audio.paused) {
        this.bell = true;
        ipcRenderer.send('reloud-icon', true);
        audio.play();
        this.dialogNotify()
      }
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
