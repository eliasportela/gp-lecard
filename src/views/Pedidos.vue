<template>
  <div>
    <top-bar @delivery_order="buscarPedidos" @delivery_desativado="deliveryDesativado"/>
    <div style="height: 100vh; margin-left: 70px; position: relative;">
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
              <div class="d-flex justify-content-between border-bottom p-2 pointer"
                   v-for="p in pedidos" @click="selecionado = p" :class="{'bg-selecionado' : selecionado.id_pedido === p.id_pedido}">
                <div>
                  <h6 class="mb-0" :class="p.status === '5' ? 'text-danger' : 'text-dark'">
                    Pedido: {{p.id_pedido}}
                  </h6>
                  <div class="small">{{p.data_pedido}}</div>
                  <div>
                    <span class="badge badge-light text-dark pr-1" v-if="p.origin === '1'">APP Corporativo</span>
                    <span class="badge badge-light text-danger" v-else-if="p.origin === '2'">APP Geral</span>
                    <span class="badge badge-success" v-else-if="p.origin === '5'">GO LeCard</span>
                    <span class="badge badge-warning pr-1" v-else-if="p.origin === '4'">{{p.obs_pedido}}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span class="badge badge-danger" v-if="p.status === '1'">Aguardando</span>
                  <span class="badge badge-dark" v-if="p.status === '4'">Finalizado</span>
                  <span class="badge border border-danger text-danger" v-if="p.status === '5'">Cancelado</span>
                  <div v-if="!p.id_entrega && p.origin !== '4'">
                    <span class="badge badge-info" v-show="p.status === '2'">Preparando</span>
                    <span class="badge badge-dark" v-show="p.status === '3'">Entregando</span>
                  </div>
                  <div v-else-if="p.id_entrega && p.status <= 3">
                    <span class="badge badge-warning">Agendado</span>
                  </div>
                </div>
              </div>
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
              <div class="mb-2">
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
              <h6 v-if="selecionado.id_entrega">
                <b class="text-danger">Agendado:</b> {{selecionado.data_agendamento}}
              </h6>
              <h6 class="m-0" v-if="selecionado.origin === '4'"><b>Local: </b> {{selecionado.obs_pedido}}</h6>
              <h6 class="m-0" v-else-if="!selecionado.id_entrega && selecionado.previsao">
                Previsão de {{selecionado.tipo_pedido === '1' ? 'entrega' : 'retirada'}}: <b>{{selecionado.previsao}}</b>
              </h6>
              <div class="border p-2 mt-3 mb-2">
                <h5 class="font-weight-bold m-0">{{selecionado.cliente.nome_cliente}}</h5>
                <div v-if="selecionado.origin !== '3'">
                  Nº de Pedidos: {{selecionado.qtd_pedidos === '0' ? 'Primeiro pedido' : selecionado.qtd_pedidos + ' pedidos'}}
                </div>
                <div class="mt-1" v-if="selecionado.tipo_pedido === '1'">
                  <h6 class="text-success font-weight-bold m-0">ENTREGAR EM:</h6>
                  <div>
                    {{selecionado.cliente.endereco}}, {{selecionado.cliente.numero}}, {{selecionado.cliente.bairro}} - {{selecionado.cliente.nome_cidade}} <br>
                    Cep: {{selecionado.cliente.cep}}
                    <span v-show="selecionado.cliente.complemento">-</span>
                    {{selecionado.cliente.complemento}}
                    <br>
                    <b>Telefone: </b>
                    <a :href="'https://api.whatsapp.com/send?phone=+55'+ selecionado.cliente.telefone" class="text-info" target="_blank">
                      <b>{{selecionado.cliente.telefone | phone}}</b>
                    </a>
                  </div>
                </div>
                <div class="mt-1" v-else-if="selecionado.tipo_pedido === '2'">
                  <h6 class="text-info font-weight-bold m-0">RETIRAR NO LOCAL</h6>
                  <div>
                    Cliente vai retirar o pedido
                  </div>
                  <b>Telefone: </b>
                  <a :href="'https://api.whatsapp.com/send?phone=+55'+ selecionado.cliente.telefone" class="text-info" target="_blank">
                    <b>{{selecionado.cliente.telefone | phone}}</b>
                  </a>
                </div>
                <div class="mt-1" v-else="selecionado.tipo_pedido === '3'">
                  <h6 class="text-warning font-weight-bold m-0">CONSUMIR NO LOCAL</h6>
                  <div>
                    Cliente vai consumir o pedido no local
                  </div>
                </div>
              </div>
              <hr class="d-none">
              <div class="mb-3">
                <div class="p-3 border-bottom" v-for="i in selecionado.produtos">
                  <span class="bg-dark text-white rounded-sm px-1 float-right small"><b>R$ {{(i.quantidade * i.valor) | valor}}</b></span>
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
              <hr class="d-none">
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
      </div>
    </div>

    <modal :opened="modalCancelamento">
      <label class="small"><b>Motivo do cancelamento (min 6 letras) *</b></label>
      <textarea id="text-cancelamento" class="form-control mb-4" rows="5" placeholder="Informe o motivo de ter recusado este pedido" style="resize: none" v-model="motivoRecusa">
      </textarea>
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

export default {
  name: 'Pedidos',
  components: {
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

    buscarPedidos(play, callback) {
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
            if (play) {
              this.pedidos.find(p => p.status === '1' && !p.id_entrega) ? this.$emit('playNotification') : '';
            }

            let existe = false;
            if (this.selecionado.id_pedido) {
              const pedido = this.pedidos.find(p => p.id_pedido === this.selecionado.id_pedido);
              if (pedido) {
                existe = true;
                this.selecionado = pedido;
                this.$nextTick(function () {
                  if (callback) {
                    callback();
                  }
                });
              }
            }

            if (!existe) {
              this.selecionado = this.pedidos[0];
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
        this.$emit('silenciar');
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
            });
          }

          dados.socket_id = this.selecionado.cliente.id_cliente + (this.selecionado.origin === '2' ? 'lecard_app_geral' : empresa.token);
          if (this.selecionado.user_whatsapp && status !== 4) {
            dados.to = this.selecionado.user_whatsapp;
            dados.token = empresa.token;
            const nome_cliente = this.selecionado.cliente ? this.selecionado.cliente.nome_cliente.split(" ") : ["cliente"];

            switch (status) {
              case 2:
                dados.msg = ["🤖\n\n" + nome_cliente[0] + ", já estamos fazendo o seu pedido 😋. Avisaremos quando ele estiver pronto."];
                break;

              case 3:
                if (this.selecionado.previsao_prazo == 1) {
                  dados.msg = ["🤖\n\nhuummm 😋... Segura a fome aí " + nome_cliente[0] + ", seu pedido já saiu pra entrega 🛵."];
                }
                break;

              case 5:
                dados.msg = ["🤖\n\n" + nome_cliente[0] + " infelizmente seu pedido foi recusado, se preferir, entre em contato conosco para entender melhor.\n\n*Motivo cancelamento:* " + this.motivoRecusa];
                break;
            }
          }

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
      this.$emit('silenciar');

      setTimeout(() => {
        document.getElementById('text-cancelamento').focus()
      }, 500)
    },

    deliveryDesativado() {
      this.$swal('', 'Seu delivery está desativado, seus pedidos não serão aceitos!')
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

  created() {
    // ipcRenderer.on('print-return', (event, arg) => {
    //   // console.log(arg);
    // });
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

    pagamento(id) {
      switch (parseInt(id)) {
        case 1:
          return "Dinheiro";
        case 3:
          return "Cartão de Crédito";
        case 4:
          return "Cartão de Débito";
        case 5:
          return "Dinheiro e Cartão";
        default:
          return "Outros";
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
