<template>
  <div>
    <div class="fixed-top shadow-sm bg-white">
      <div class="container-fluid">
        <div class="row py-1 align-items-center">
          <div class="col-4">
            <router-link to="/empresas" class="text-dark">
              <img src="../assets/logo-lecard.png" alt="" style="width: 32px" id="imgEmpresa">
              <span class="font-weight-bold small pl-3">{{dados.nome_fantasia}} {{homologacao ? '(Teste)' : ''}}</span>
            </router-link>
          </div>
          <div class="col-8 d-flex justify-content-end align-items-center">
            <div class="mr-3" v-show="bell">
              <button class="btn btn-outline-danger" @click="silenciar">
                Silenciar
              </button>
            </div>
            <button class="btn btn-dark mr-2 text-nowrap" @click="openTempo()" :disabled="load" v-if="!load">
              Taxa e Tempo
            </button>
            <button class="btn mr-2 text-nowrap" :class="empresa.ativo === '1' ? 'btn-danger' : 'btn-dark'" @click="toogleStatus()" :disabled="load" v-if="!load">
              {{empresa.ativo === '1' ? 'Desativar agora' : 'Ativar Loja'}}
            </button>
            <div class="border rounded p-1 px-2 pointer" title="Clique para atualizar a pagina" @click="reloadPage" style="width: 250px; height: 50px">
              <div class="text-center" v-if="load">
                <div class="animated flipInY infinite mt-1">
                  <img src="../assets/logo-lecard.png" alt="" style="width: 32px">
                </div>
              </div>
              <div v-else>
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
      <a href="javascript:" class="btn btn-block" v-if="page === 'Pdv' && bell" style="position: relative" @click="modalPedidos = true">
        <img src="../assets/icons/orders.svg" class="animated bounceIn infinite" alt="">
        <span>Pedidos</span>
        <div style="position: absolute; top: 0; right: 0" v-if="bell">
          <span class="badge badge-danger p-1" style="width: 16px; height: 16px; border-radius: 50px;">1</span>
        </div>
      </a>
      <router-link to="/pedidos" active-class="btn--active" class="btn btn-block" v-else>
        <img src="../assets/icons/orders.svg" alt="">
        <span>Pedidos</span>
      </router-link>
      <router-link to="/cardapio" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/food-menu.svg" alt="">
        <span>Cardápio</span>
      </router-link>
      <router-link to="/vantagens" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/vantagens.svg" alt="">
        <span>Fidelidade</span>
      </router-link>
      <router-link to="/pdv" active-class="btn--active" class="btn btn-block">
        <img src="../assets/icons/pos.svg" alt="">
        <span>Comandas</span>
      </router-link>
      <button class="btn btn-block" @click="callTawkTo">
        <img src="../assets/icons/information.svg" alt="Ajuda">
        <span>Ajuda</span>
      </button>

      <div style="bottom: 8px; left: 8px; right: 8px; position: absolute">
        <router-link to="/portal" active-class="btn--active"  class="btn btn-block">
          <img src="../assets/icons/report.svg" alt="">
          <span>Portal</span>
        </router-link>
        <router-link to="/impressora" active-class="btn--active" class="btn btn-block">
          <img src="../assets/icons/settings.svg" alt="">
          <span>Configs</span>
        </router-link>
      </div>
    </div>

    <modal :opened="modalOflline">
      <h5 class="text-center">Atenção!</h5>
      <div>Seus pedidos não estão sendo sincronizados. Por favor verifique sua conexão com a internet!</div>
      <div class="text-center mt-4">
        <button class="btn btn-danger" @click="reloadPage">OK</button>
      </div>
    </modal>

    <modal :opened="modalPedidos" width="full" v-if="page !== 'Pedidos'">
      <div class="container-fluid border-bottom pb-2">
        <button class="btn btn-outline-danger" style="margin-top: 10px" @click="modalPedidos = false">Voltar</button>
      </div>
      <container-pedidos v-if="modalPedidos"/>
    </modal>

    <modal :opened="modalTempo">
      <div class="row justify-content-end">
        <div class="col-md-6" v-if="empresas.length > 1">
          <div class="mb-3">
            <select class="form-control bg-light" id="empresaTempo" v-model="token" @change="openTempo">
              <option :value="e.key" v-for="e in empresas">{{e.nome_fantasia}}</option>
            </select>
          </div>
        </div>
      </div>
      <div v-if="!loadTempo">
        <div class="card border">
          <div style="padding: 4px 12px 8px">
            <div class="row no-gutters align-items-end">
              <div class="col-md-4">
                <label class="m-0 font-weight-bold small" for="tempoRetirada">Entregas</label>
                <div>
                  <div class="d-inline-block pointer" @click="toogleOperacao(true)">
                    <span class="pr-2 small" :class="entrega.tipo_delivery !== '2' ? 'text-success' : 'text-secondary'">{{entrega.tipo_delivery !== '2' ? 'Habilitado' : 'Desativado'}}</span>
                    <img class="switch" src="../assets/icons/switch-on.svg" v-show="entrega.tipo_delivery !== '2'">
                    <img class="switch" src="../assets/icons/switch-off.svg" v-show="entrega.tipo_delivery === '2'">
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <label class="m-0 font-weight-bold small" for="tempoRetirada">Retiradas</label>
                <div>
                  <div class="d-inline-block pointer" @click="toogleOperacao(false)">
                    <span class="pr-2 small" :class="entrega.tipo_delivery <= 2 ? 'text-success' : 'text-secondary'">{{entrega.tipo_delivery <= 2 ? 'Habilitado' : 'Desativado'}}</span>
                    <img class="switch" src="../assets/icons/switch-on.svg" v-show="entrega.tipo_delivery <= 2">
                    <img class="switch" src="../assets/icons/switch-off.svg" v-show="entrega.tipo_delivery === '3'">
                  </div>
                </div>
              </div>
              <div class="col-md-4" :class="{'invisible': entrega.tipo_delivery > 2}">
                <div>
                  <label class="m-0 font-weight-bold small" for="tempoRetirada">Retirada (minutos)</label>
                  <input type="number" id="tempoRetirada" min="0" max="300" class="form-control m-0" v-model="entrega.media_retirada" placeholder="Minutos">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="card border mt-2" v-show="entrega.tipo_delivery !== '2'">
          <div class="card-body">
            <div class="height-card">
              <div class="text-center">
                <div class="row no-gutters py-2 border-bottom small font-weight-bold d-none d-md-flex">
                  <div class="col-3 col-md-4">Alcance</div>
                  <div class="col-5 col-md-4">Taxa</div>
                  <div class="col-4 col-md-4">Tempo (mins)</div>
                </div>
                <div class="row no-gutters align-items-center py-2 border-bottom" v-for="(e, index) in entrega.raios" :key="index">
                  <div class="col-3 col-md-4 small pr-2">Até {{e.raio_entrega / 1000}} km</div>
                  <div class="col-5 col-md-4 pr-2"><money class="form-control" v-model="e.taxa_entrega"/></div>
                  <div class="col-4 col-md-4 pr-1">
                    <input type="number" min="0" max="300" class="form-control" v-model="e.tempo_entrega">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="text-center" style="padding: 120px 0" v-else>
        <div class="animated flipInY infinite">
          <img src="../assets/logo-lecard.png" alt="" style="width: 48px">
        </div>
        <div class="mt-2">Por favor aguarde..</div>
      </div>
      <div class="text-center d-flex justify-content-between pt-4">
        <button class="btn btn-dark mr-2" @click="modalTempo = false">Voltar</button>
        <button class="btn btn-danger" @click="salvarTempo()" v-show="!loadTempo">Salvar</button>
      </div>
    </modal>

  </div>
</template>

<script>
import ContainerPedidos from "./ContainerPedidos";
const Config = require('electron-config');
const { ipcRenderer } = require('electron');
const config = new Config();
import Modal from '../components/Modal'
import {Money} from 'v-money'

export default {
  name: 'TopBar',
  components: {ContainerPedidos, Modal, Money},
  props: {
    msg: String,
  },
  data() {
    return {
      token: localStorage.getItem('key'),
      empresa: {
        ativo: '1',
        status: '1',
        aberto: '0',
        entregas: [],
      },

      load: true,
      modalOflline: false,
      modalPedidos: false,

      connected: false,
      notification: '',
      homologacao: config.get('base_server'),
      page: '',

      modalTempo: false,
      loadTempo: false,
      entrega: {
        raios: [],
        media_retirada: '',
        tipo_delivery: '1'
      }
    }
  },

  methods: {
    toogleOperacao(entrega) {
      if (entrega) {
        if (this.entrega.tipo_delivery === '2') {
          this.entrega.tipo_delivery = '1';

        } else {
          this.entrega.tipo_delivery = ['1','3'].includes(this.entrega.tipo_delivery) ? '2' : '1';
        }

      } else {
        if (this.entrega.tipo_delivery === '3') {
          this.entrega.tipo_delivery = '1';

        } else {
          this.entrega.tipo_delivery = ['1','2'].includes(this.entrega.tipo_delivery) ? '3' : '2';
        }
      }
    },

    silenciar() {
      this.$store.commit('setBell', false);
      this.pauseNotification();
    },

    statusEmpresa(aviso) {
      if (localStorage.getItem('token')) {
        this.$http.get(this.base_server + 'delivery/' + localStorage.getItem('token') + '/empresa/status/')
          .then(response => {
            this.empresa = response.data;
            this.empresa.token = localStorage.getItem('token');

            if (aviso && this.empresa.ativo === '0' && !sessionStorage.getItem('delivery_desativado')){
              this.$swal({
                text: "O delivery está desativado! Ative-o para receber seus pedidos.",
                buttons: ["Cancelar", "Ativar"],
                dangerMode: true
              }).then((result) => {
                if (result) {
                  this.changeStatus();
                }
              });

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
        const msg = this.empresas.length > 1 ? "Você está preste a desativar todas as empresas que está logado." : "Ao desativar sua loja seus clientes não poderão realizar mais pedidos ao menos que você ative novamente a empresa.";
        this.$swal({
          text: msg + " Deseja realmente desativar?",
          buttons: ["Não", "Sim"],
          dangerMode: true
        }).then((result) => {
          if (result) {
            this.changeStatus();
          }
        });

      } else {
        this.changeStatus();
      }
    },

    changeStatus() {
      const dados = { status: this.empresa.ativo === '1' ? '0' : '1' };
      this.empresa.ativo = dados.status;
      this.load = true;

      this.empresas.forEach(e => {
        this.$http.post('delivery/empresa/status/' + e.key, dados)
          .then(response => {

            if (e.isDefault) {
              this.statusEmpresa();
            }

          }, res => {
            console.log(res);
            this.empresa.ativo = dados.status === '1' ? '0' : '1';
            this.$swal(res.data.msg ? res.data.msg : 'Erro temporário');
          });
      });
    },

    reloadPage() {
      // this.dialogNotify()
      ipcRenderer.send('reload');
    },

    openTempo() {
      this.modalTempo = true;
      this.loadTempo = true;

      this.$http.get('entrega/config/' + this.token)
        .then(response => {
          this.entrega = response.data;
          this.loadTempo = false;

        }, res => {
          this.loadTempo = false;
          this.$swal(res.data.result, res.data.msg);
        })
    },

    salvarTempo() {
      this.loadTempo = true;
      this.$http.post('entrega/config/' + this.token, this.entrega)
        .then(res => {
          this.$swal("Taxa e tempo editado com sucesso!");
          this.loadTempo = false;
          this.modalTempo = false;

        }, res => {
          console.log(res);
          this.loadTempo = false;
          this.$swal(res.data.result,res.data.msg);
        });
    },

    callTawkTo() {
      ipcRenderer.send('openChat');
    }
  },

  computed: {
    dados() {
      return this.$store.state.dataUser
    },

    bell() {
      return this.$store.state.bell.status
    },

    empresas() {
      return this.$store.state.empresas
    }
  },

  sockets: {
    connect() {
      this.connected = true;
      this.modalOflline = false;
    },

    disconnect() {
      this.modalOflline = true;
      this.connected = false;
    },

    status_empresa(data) {
      if (data.aberto !== this.empresa.ativo) {
        this.statusEmpresa();
      }
    }
  },

  mounted() {
    this.statusEmpresa(true);
    this.connected = this.$socket ? this.$socket.connected : false;
    this.page = this.$route.name;
  },

  created() {
    this.$parent.$on('ativarDelivery', () => {
      this.toogleStatus();
    });

    this.$parent.$on('ativarEmpresa', () => {
      if (this.empresa.aberto === '0') {
        this.statusEmpresa();
      }
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
  .height-card {
    height: 210px;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
