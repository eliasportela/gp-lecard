<template>
  <div>
    <div class="container-pedidos">
      <div class="coluna-1">
        <div class="row no-gutters mb-2" v-if="pesquisa.nolocal !== '3'">
          <div class="col-6 pr-1">
            <select class="form-control" v-model="pesquisa.status" @change="buscarPedidos(false)">
              <option value="1">Em andamento</option>
              <option value="4">Finalizados</option>
              <option value="5">Cancelados</option>
            </select>
          </div>
          <div class="col-6 pl-1">
            <select class="form-control" v-model="pesquisa.nolocal" @change="buscarNoLocal()">
              <option value="1">Todos</option>
              <option value="2">No Local</option>
              <option value="3">Filtrar data</option>
            </select>
          </div>
        </div>
        <div class="row no-gutters mb-2" v-else>
          <div class="col-7 pr-1">
            <input type="date" id="noLocal" class="form-control" v-model="pesquisa.data" @change="buscarPedidos(false)">
          </div>
          <div class="col-5 pl-1">
            <button class="btn btn-dark btn-block" @click="clearPesquisa()">Voltar</button>
          </div>
        </div>
        <div class="bg-white coluna-1-1 border">
          <div v-show="!loading">
            <a href="javascript:" :id="'listPedido' + p.id_pedido" class="d-flex justify-content-between border-bottom px-2 py-2 text-decoration-none text-dark"
                 v-for="(p, i) in pedidos" :key="i" @click="selecionado = p" :class="{'bg-selecionado' : selecionado.id_pedido === p.id_pedido}">
              <div>
                <h6 class="mb-0">{{p.cliente.nome_cliente}}</h6>
                <div class="mb-0 small">
                  Pedido: {{p.id_pedido}} | {{p.data_pedido}}
                </div>
                <div class="small font-weight-bold">
                  <span class="text-success" v-if="p.tipo_pedido === '1'">Entregar Pedido</span>
                  <span class="text-info" v-if="p.tipo_pedido === '2'">Retirar no Local</span>
                  <span class="text-warning" v-if="p.tipo_pedido === '3'">Consumir no local</span>
                </div>
                <div class="small" v-if="p.origin === '4'">{{p.obs_pedido}}</div>
                <span class="badge badge-light mr-1" v-if="p.origin === '2'">APP Geral</span>
                <span class="badge badge-success mr-1" v-else-if="p.origin === '5'">GO LeCard</span>
                <span class="badge badge-dark animated fadeIn infinite slower" v-if="p.status === '2' && p.is_late === '1' && !selecionado.id_entrega">
                  Atrasado: {{p.previsao}}
                </span>
              </div>
              <div class="text-right">
                <span class="badge badge-danger" v-if="p.status === '1'">Aguardando</span>
                <span class="badge badge-info" v-if="p.status === '2'">Preparando</span>
                <span class="badge badge-dark" v-if="p.origin !== '4' && p.status === '3'">Entregando</span>
                <span class="badge badge-dark" v-if="p.status === '4'">Finalizado</span>
                <div v-else-if="p.id_entrega && p.status <= 3"><span class="badge badge-warning">Agendado</span></div>
                <div v-else-if="p.status === '5'"><span class="badge border border-danger text-danger">Cancelado</span></div>
              </div>
            </a>
          </div>
        </div>
        <div class="container-aceitar bg-white" style="left: 0; right: 8px; width: auto" v-if="!loading">
          <div class="card p-2 small">
            <div class="d-flex justify-content-between">
              <div>
                <div class="font-weight-bold m-0">APP Delivery ({{totais.quantidade}})</div>
                <div class="text-muted">R$ {{totais.total | valor}}</div>
              </div>
              <div class="text-right">
                <div class="font-weight-bold m-0">No Local ({{nolocal.quantidade}})</div>
                <div class="text-muted">R$ {{nolocal.total | valor}}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="coluna-2">
        <div class="conteudo-c2 border">
          <div v-show="selecionado.produtos.length === 0">
            <div v-if="loading" style="padding-top: 28vh">
              <img src="../assets/logo-lecard.png" class="d-block m-auto animated flipInY infinite" alt="Logo Lecard" style="width: 72px;">
            </div>
            <div v-else class="container-produtos">
              <msg-home class="mt-1"/>
            </div>
          </div>
          <div id="containerPedido" class="container-produtos" v-if="selecionado.cliente" v-show="!loading && selecionado.produtos.length > 0">
            <div id="andamento" class="font-weight-bold float-right">
              <div v-if="!selecionado.id_entrega">
                <span class="badge badge-danger" v-if="selecionado.status === '1'">Aguardando</span>
                <span class="badge badge-info" v-if="selecionado.status === '2'">Preparando</span>
                <span class="badge badge-dark" v-if="selecionado.status === '3'">Entregando</span>
                <span class="badge badge-dark" v-if="selecionado.status === '4'">Pedido Finalizado</span>
                <span class="badge badge-danger" v-if="selecionado.status === '5'">Pedido Cancelado</span>
              </div>
              <span class="badge badge-warning" v-else-if="selecionado.id_entrega">Pedido Agendado</span>
            </div>
            <div>
              <h5 class="m-0" v-if="pesquisa.keys.length > 1">{{selecionado.nome_fantasia}}</h5>
              <div class="m-0 font-weight-bold">Pedido: {{selecionado.id_pedido}} - {{selecionado.data_pedido}}</div>
              <div class="font-weight-bold" v-if="selecionado.origin === '2'">
                <span class="badge badge-info">Realizado pelo LeCard Geral</span>
              </div>
            </div>
            <div v-show="selecionado.status === '5'">
                <span><b class="text-danger">Cancelado:</b>
                  {{selecionado.obs_cancelamento ? selecionado.obs_cancelamento : 'Pedido cancelado pelo cliente'}}
                </span>
            </div>
            <h6 class="m-0" v-if="selecionado.id_entrega">
              <b class="text-danger">Agendado:</b> {{selecionado.data_agendamento}}
            </h6>
            <h6 class="m-0" v-else-if="!selecionado.id_entrega && selecionado.previsao && selecionado.status < 4">
              Previsão de {{selecionado.tipo_pedido === '1' ? 'entrega' : 'retirada'}}: <b>{{selecionado.previsao}}</b>
            </h6>
            <div class="border p-2 mt-3 mb-2">
              <h5 class="font-weight-bold m-0">{{selecionado.cliente.nome_cliente}}</h5>
              <div v-if="selecionado.origin !== '3'">
                Nº de Pedidos: {{selecionado.qtd_pedidos === '0' ? 'Primeiro pedido' : selecionado.qtd_pedidos + ' pedidos'}}
              </div>
              <b>Telefone: </b>
              <a :href="'https://api.whatsapp.com/send?phone=+55'+ selecionado.cliente.telefone" class="text-info" target="_blank">
                <b>{{selecionado.cliente.telefone | phone}}</b>
              </a>
            </div>
            <div class="border p-2 mt-2 mb-2" v-if="selecionado.tipo_pedido === '2'">
              <h6 class="text-info font-weight-bold m-0">RETIRAR NO LOCAL</h6>
              <div>
                Cliente vai retirar o pedido
                <h6 class="m-0" v-if="selecionado.origin === '4'"><b></b> {{selecionado.obs_pedido}}</h6>
              </div>
            </div>
            <div class="border p-2 mt-2 mb-2" v-if="selecionado.tipo_pedido === '3'">
              <h6 class="text-warning font-weight-bold m-0">CONSUMIR NO LOCAL</h6>
              <div>
                Cliente vai consumir o pedido no local
                <h6 class="m-0" v-if="selecionado.origin === '4'"><b></b> {{selecionado.obs_pedido}}</h6>
              </div>
            </div>
            <div class="border p-2 mt-2 mb-2" v-if="selecionado.tipo_pedido === '1'">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="text-success font-weight-bold m-0">ENTREGAR PEDIDO</h6>
                  <div>
                    <span v-if="!selecionado.version">{{selecionado.cliente.endereco}}</span><span v-else>{{selecionado.cliente.logradouro}}</span>,
                    {{selecionado.cliente.numero}}, {{selecionado.cliente.bairro}} <span v-if="selecionado.cliente.distance"> - {{selecionado.cliente.distance | kilometer}}</span><br>
                    <div>{{selecionado.cliente.nome_cidade}} - {{selecionado.cliente.sigla_estado}} | CEP: {{selecionado.cliente.cep | cep}}</div>
                    <div v-if="selecionado.cliente.complemento">- {{selecionado.cliente.complemento}}</div>
                  </div>
                </div>
                <div class="text-center d-print-none" v-if="selecionado.cliente.lat_endereco">
                  <a href="javascript:" class="btn btn-success mb-1" @click="openMapa()">
                    <img src="../assets/icons/location-light.svg" style="width: 18px">
                    <div class="small mt-1">Ver no mapa</div>
                  </a>
                </div>
              </div>
            </div>
            <hr class="d-none">
            <div class="mb-2">
              <div class="py-3 px-2 border-bottom" v-for="i in selecionado.produtos">
                <div class="float-right">
                  <span class="badge badge-dark">R$ {{(i.quantidade * i.valor) | valor}}</span>
                </div>
                <div>
                  <h6 class="mb-0 font-weight-bold">{{i.quantidade}}x - {{i.produto.nome_produto}}</h6>
                  <div v-for="d in i.divisoes">
                    # {{d.nome_produto}}
                  </div>
                  <div v-for="d in i.adicionais">
                    + {{d.qtd}}x {{d.nome_produto}} <span v-show="d.valor > 0">R$ {{d.valor | valor}}</span>
                  </div>
                  <div class="font-weight-bold" v-show="i.observacao">
                    Obs: {{i.observacao}}
                  </div>
                </div>
              </div>
            </div>
            <hr class="d-none">
            <div class="border p-2 mb-2" v-if="selecionado.id_pagamento === '15'">
              <h6 class="text-info font-weight-bold m-0">Pagamento via PIX</h6>
              <div class="small">Confira se o valor foi creditado em sua conta</div>
            </div>
            <div class="border p-2">
              <div>
                <span class="float-right">R$ {{(parseFloat(selecionado.total) - parseFloat(selecionado.valor_frete)) + parseFloat(selecionado.valor_desconto) | valor}}</span>
                SubTotal:
              </div>
              <div>
                <span class="float-right">R$ {{selecionado.valor_frete | valor}}</span>
                Taxa de Entrega:
              </div>
              <div>
                <span class="float-right">R$ {{selecionado.valor_desconto | valor}}</span>
                Desconto:
              </div>
              <div>
                <span class="float-right">{{selecionado.nome_pagamento}}</span>
                Forma de Pagamento:
              </div>
              <div v-if="selecionado.troco && (parseFloat(selecionado.troco) > selecionado.total)">
                <span class="float-right">R$ {{(selecionado.troco - selecionado.total) | valor}}</span>
                Troco:
              </div>
              <div>
                <span class="float-right font-weight-bold">R$ {{selecionado.total | valor}}</span>
                <b>Cobrar do Cliente:</b>
              </div>
            </div>
            <div v-if="selecionado.origin !== '4' && selecionado.obs_pedido"><b>Obs:</b> {{selecionado.obs_pedido}}</div>
            <div v-if="selecionado.troco > 0"><b>Obs:</b> Troco para R${{(selecionado.troco) | valor}}</div>
          </div>
        </div>
        <div class="container-aceitar bg-white" style="left: 0; right: 0; width: auto">
          <div class="card p-2">
            <div class="d-flex justify-content-between">
              <div class="w-25 mr-2">
                <button class="btn btn-outline-secondary btn-block" :disabled="!selecionado.status || loading" @click="imprimir()">Imprimir</button>
              </div>
              <div class="w-25 mr-2" v-show="['1','2','3'].includes(selecionado.status)">
                <button class="btn btn-danger btn-block" @click="openModalCancelamento" :disabled="loading">{{selecionado.status === '1' ? 'Recusar' : 'Cancelar'}}</button>
              </div>
              <div class="w-50 ml-auto" v-if="selecionado.status === '1'">
                <button class="btn btn-success btn-block" @click="acaoPedido(2)" :disabled="loading">Aceitar</button>
              </div>
              <div class="w-50 ml-auto" v-if="selecionado.status === '2'">
                <button class="btn btn-dark btn-block" @click="acaoPedido(3)" :disabled="loading">Despachar</button>
              </div>
              <div class="w-50 ml-auto" v-if="selecionado.status === '3'">
                <button class="btn btn-info btn-block" @click="acaoPedido(4)" :disabled="loading">Finalizar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <modal :opened="modalCancelamento" width="small">
        <label class="small"><b>Motivo do cancelamento (min 6 letras) *</b></label>
        <textarea id="text-cancelamento" class="form-control mb-4" rows="5" placeholder="Informe o motivo de ter recusado este pedido" style="resize: none" v-model="motivoRecusa"></textarea>
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-6">
              <button class="btn btn-dark btn-block rounded-sm" @click="modalCancelamento = false">Voltar</button>
            </div>
            <div class="col-md-6">
              <button class="btn btn-danger btn-block rounded-sm" @click="acaoPedido(5)" :disabled="motivoRecusa.length < 6"><b>Confirmar</b></button>
            </div>
          </div>
        </div>
      </modal>

      <modal :opened="modalMapa" width="full">
        <div class="container-fluid border-bottom pb-2">
          <button class="btn btn-outline-danger" style="margin-top: 10px" @click="modalMapa = false">Voltar</button>
        </div>
        <map-leaflet />
      </modal>
    </div>
  </div>
</template>

<script>
import MsgHome from "../components/MsgHome";
const { ipcRenderer } = require('electron');
const Config = require('electron-config');
const config = new Config();

import TopBar from '@/components/TopBar.vue'
import HelloWorld from '@/components/HelloWorld.vue'
import Modal from '../components/Modal'
import MapLeaflet from "./MapLeafleat";

export default {
  name: 'ContainerPedidos',
  components: {
    MapLeaflet,
    MsgHome,
    Modal,
    HelloWorld, TopBar
  },
  data() {
    return {
      loading: true,
      pedidos: [],
      pesquisa: {
        status: 1,
        keys: [],
        nolocal: 1,
        data: ''
      },
      selecionado: {
        produtos: [],
        troco: 0,
        total: 0
      },
      modalCancelamento: false,
      modalMapa: false,
      motivoRecusa: '',
      socket: true,
      totais: {
        total: 0,
        quantidade: 0
      },
      nolocal: {
        total: 0,
        quantidade: 0
      },
      empresas: []
    }
  },

  methods: {
    buscarNoLocal() {
      if (this.pesquisa.nolocal === '2') {
        this.pedidos = this.pedidos.filter(p => p.origin === '4');
        if (this.pedidos.length) {
          this.selecionado = this.pedidos[0];
        } else {
          this.selecionado = {
            produtos: [],
            total: 0
          }
        }
      } else if (this.pesquisa.nolocal === '1') {
        this.buscarPedidos();

      } else {
        this.pesquisa.data = new Date().toDateInputValue();
        setTimeout(() => {
          document.getElementById("noLocal").focus()
        }, 200);
        this.buscarPedidos(false);
      }
    },

    clearPesquisa() {
      this.pesquisa.status = 1;
      this.pesquisa.nolocal = 1;
      this.pesquisa.data = '';
      this.buscarPedidos(false);
    },

    buscarPedidos(play, callback, scroll) {
      if (this.pesquisa.nolocal === '2') {
        this.pesquisa.nolocal = '1';
      }

      this.loading = true;
      this.$http.get('delivery/pedidos', {params: this.pesquisa})
        .then(response => {
          if (!response.data) {
            return;
          }

          this.pedidos = response.data.pedidos;
          this.totais = response.data.totais;
          if (response.data.nolocal) {
            this.nolocal = response.data.nolocal;
          }

          if (this.pedidos.length > 0) {
            if (play && this.pedidos.find(p => p.status === '1' && !p.id_entrega)) {
              this.$store.commit('setBell', true);
              this.playNotification();
            }

            let existe = false;
            if (this.selecionado.id_pedido) {
              const pedido = this.pedidos.find(p => p.id_pedido === this.selecionado.id_pedido);
              if (pedido) {
                existe = true;
                this.selecionado = pedido;
                this.$nextTick(function () {
                  this.scrollPedido();

                  if (callback) {
                    callback();
                  }
                });
              }
            }

            if (!existe) {
              this.selecionado = this.pedidos[scroll ? (this.pedidos.length - 1) : 0];
              this.$nextTick(function () {
                this.scrollPedido();
              });
            }

            this.$emit('ativarEmpresa');

          } else {
            this.selecionado = {
              produtos: [],
              total: 0
            }
          }

          this.loading = false;

        }, res => {
          console.log(res);
          this.loading = false;
          if (res.status === 401) {
            ipcRenderer.send('reload');

          } else if (!navigator.onLine) {
            this.$swal("Atenção!", "Não conseguimos acessar sua conexão com a internet. Por favor verifique se seu computador tem uma conexão estável.");
          }
        });
    },

    scrollPedido() {
      const el = document.getElementById('listPedido' + this.selecionado.id_pedido);
      if (el) el.scrollIntoView(false);
    },

    acaoPedido(status) {
      if (this.loading) {
        return;
      }

      this.modalCancelamento = false;
      this.loading = true;

      let dados = {
        id_pedido: this.selecionado.id_pedido,
        status: status,
        obs_cancelamento: this.motivoRecusa
      };

      if (status === 2) {
        this.$store.commit('setBell', false);
        this.pauseNotification();
      }

      const empresa = this.empresas.find(e => e.token === this.selecionado.token);
      if (!empresa) {
        return;
      }

      this.$http.post('delivery/pedidos/' + empresa.key, dados, {emulateJSON: true})
        .then(res => {
          this.$socket.emit('notification', {token: empresa.token, play: false});

          if (res.data) {
            this.buscarPedidos(false, () => {
              if (status === 2 && localStorage.getItem('impressaoAutomatica') === '1') {
                this.imprimir(localStorage.getItem('nCopias'));
              }
            }, true);
          }

          dados.socket_id = this.selecionado.cliente.id_cliente + (this.selecionado.origin === '2' ? 'lecard_app_geral' : empresa.token);
          this.$socket.emit('delivery_status', dados);
          this.motivoRecusa = '';

        }, res => {
          this.loading = false;
          const data = res.data;

          if (data && data.status == 1) {
            this.$swal("", data.msg).then(() => {
              this.buscarPedidos(false);
            });
          }

          console.log(res);
          if (res.status === 401) {
            ipcRenderer.send('reload');
          }
        });
    },

    imprimir(ncopias) {
      if (!this.selecionado.id_pedido) {
        return;
      }

      let options = {
        content: document.getElementById('containerPedido').innerHTML,
        copies: ncopias ? ncopias : 1,
        zoom: localStorage.getItem('zoom')
      };
      ipcRenderer.send('print', options);
    },

    openModalCancelamento() {
      this.modalCancelamento = true;
      this.$store.commit('setBell', false);
      this.pauseNotification();

      setTimeout(() => {
        document.getElementById('text-cancelamento').focus()
      }, 500)
    },

    openMapa() {
      this.modalMapa = true;
      const pedidos = [];
      let pedido = null;

      if (this.selecionado.cliente.lat_endereco) {
        pedido = {
          id_pedido: this.selecionado.id_pedido,
          lat_endereco: this.selecionado.cliente.lat_endereco,
          long_endereco: this.selecionado.cliente.long_endereco
        }
      }

      this.pedidos.forEach((p) => {
        if (p.cliente.lat_endereco) {
          pedidos.push({
            id_pedido: p.id_pedido,
            status: p.status,
            data_pedido: p.data_pedido,
            origin: p.origin,
            id_entrega: p.id_entrega,
            nome_cliente: p.cliente.nome_cliente,
            logradouro: p.cliente.logradouro,
            numero: p.cliente.numero,
            bairro: p.cliente.bairro,
            lat_endereco: p.cliente.lat_endereco,
            long_endereco: p.cliente.long_endereco
          });
        }
      });

      const dados = {
        lat_empresa: this.user.lat_empresa,
        long_empresa: this.user.long_empresa,
        nome_fantasia: this.user.nome_fantasia,
        pedidos,
        pedido
      };

      this.$emit('openModal', dados);
    }
  },

  mounted() {
    if (!localStorage.getItem('key')) {
      return;
    }

    this.empresas = config.get('empresas') ? config.get('empresas') : [];
    this.pesquisa.keys = this.empresas.map(e => {
      return e.key
    });

    this.buscarPedidos(true);
  },

  computed: {
    user() {
      return this.$store.state.dataUser
    },
  },

  sockets: {
    connect() {
      this.buscarPedidos(true);
    },

    delivery_order() {
      this.buscarPedidos(true);
    }
  },

  filters: {
    valor(value) {
      if (value !== null || value !== undefined) {
        return parseFloat(value).toFixed(2);
      }
    },

    phone(phone) {
      if (phone) {
        if (phone.length === 10) {
          return phone.replace(/[^0-9]/g, '')
            .replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');

        } else if (phone.length === 11) {
          return phone.replace(/[^0-9]/g, '')
            .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
      }

      return phone
    },

    kilometer(value) {
      if (value !== null || value !== undefined) {
        const formated = parseFloat(value / 1000).toFixed(1);
        return formated + ' km';
      }
    },

    cep(value) {
      if (value && value.length === 8) {
        return value.substring(0,5) + '-' + value.substring(5);
      }
    }
  }
}
</script>

<style scoped>
  .container-pedidos {
    position: absolute; right: 0; left: 0; bottom: 0; top: 50px; margin: 16px 8px 8px;
  }
  .coluna-1 {
    position: absolute; top: 0; bottom: 0; width: 40%;
    padding-right: 8px;
  }
  .coluna-1 .coluna-1-1 {
    top: 28px;
    /*top: 75px;*/
    position: absolute; bottom: 62px; right: 8px; left: 0; overflow: auto; margin-top: 18px; padding: 0
  }
  .coluna-2 {
    position: absolute; top: 0; bottom: 0; right: 0; width: 60%;
  }
  .conteudo-c2 {
    position: absolute; top: 0; bottom: 62px; right: 0; left: 0;
  }
  .container-aceitar {
    position: absolute; bottom: 0; width: 100%;
  }
  .container-produtos {
    position: absolute;
    top: 0; right: 0; left: 0; bottom: 0;
    padding: 12px 12px 35px;
    overflow: auto;
  }
  .disabled {
    cursor: not-allowed;
  }
  .disabled button {
    pointer-events: none;
    opacity: 0.6!important;
  }
  .bg-selecionado {
    background-color: #e9ecef;
  }

  @media (min-width:1200px) {
    .coluna-1 {
      width: 30%;
    }
    .coluna-2 {
      width: 70%;
    }
  }
</style>
