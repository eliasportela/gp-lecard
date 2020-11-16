<template>
  <div>
    <top-bar @delivery_order="buscarPedidos(true)" @delivery_desativado="deliveryDesativado"/>
    <div style="height: 100vh; margin-left: 70px; position: relative;">
      <div class="container-pedidos">
        <div class="coluna-1">
          <select class="form-control" v-model="pesquisa.status" @change="buscarPedidos">
            <option value="1">Em andamento</option>
            <option value="4">Finalizados</option>
            <option value="5">Cancelados</option>
          </select>
          <div class="bg-white coluna-1-1 border">
            <div v-show="!loading">
              <div class="border-bottom p-2 pointer" v-for="p in pedidos" @click="selecionado = p" :class="{'bg-selecionado' : selecionado.id_pedido === p.id_pedido}">
                <span class="small font-weight-bold bg-danger text-white rounded-sm px-1 float-right" v-show="p.status === '1'">Aguardando</span>
                <span class="small font-weight-bold bg-danger text-white rounded-sm px-1 float-right" v-show="p.status === '5'">Cancelado</span>
                <span class="small font-weight-bold bg-dark text-white rounded-sm px-1 float-right" v-show="p.status === '4'">Finalizado</span>
                <div v-show="!p.id_entrega">
                  <span class="small font-weight-bold bg-info text-white rounded-sm px-1 float-right" v-show="p.status === '2'">Preparando</span>
                  <span class="small font-weight-bold bg-dark text-white rounded-sm px-1 float-right" v-show="p.status === '3'">Entregando</span>
                </div>
                <div v-show="p.id_entrega && (p.status === '2' || p.status === '3')">
                  <span class="small font-weight-bold bg-warning text-white rounded-sm px-1 float-right">Agendado</span>
                </div>
                <h6 class="mb-0">Pedido: {{p.id_pedido}}</h6>
                <span class="small">{{p.data_pedido}}</span>
              </div>
            </div>
          </div>
          <div class="container-aceitar bg-white" style="left: 0; right: 16px; width: auto">
            <div class="container-fluid small card">
              <div class="row">
                <div class="col-12 py-2" v-if="!loading">
                  <div class="font-weight-bold m-0">Pedidos ({{totais.quantidade}})</div>
                  <div class="text-muted">R$ {{totais.total | valor}}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="coluna-2">
          <div class="conteudo-c2 border">
            <div style="display: flex; height: 90%; justify-content: center; align-items: center;" v-show="selecionado.produtos.length === 0">
              <div v-show="loading">
                <img src="../assets/logo-lecard.png" class="d-block m-auto animated flipInY infinite" alt="Logo Lecard" style="width: 64px;">
              </div>
              <div v-show="!loading"><b>Selecione um pedido</b></div>
            </div>
            <div id="containerPedido" class="container-produtos" v-if="selecionado.cliente" v-show="!loading && selecionado.produtos.length > 0">
              <div id="andamento" class="font-weight-bold float-right" v-show="!selecionado.id_entrega">
                <span class="badge badge-danger" v-show="selecionado.status === '1'">Aguardando</span>
                <span class="badge badge-info" v-show="selecionado.status === '2'">Preparando</span>
                <span class="badge badge-dark" v-show="selecionado.status === '3'">Entregando</span>
                <span class="badge badge-dark" v-show="selecionado.status === '4'">Finalizado</span>
                <span class="badge badge-danger" v-show="selecionado.status === '5'">Cancelado</span>
              </div>
              <div class="small font-weight-bold float-right" v-show="selecionado.id_entrega">
                <span class="bg-warning text-white rounded-sm px-1">Pedido Agendado</span>
              </div>
              <div class="mb-3">
                <h5 class="m-0" v-if="pesquisa.keys.length > 1">{{selecionado.nome_fantasia}}</h5>
                <div class="m-0 font-weight-bold">Pedido: {{selecionado.id_pedido}} - {{selecionado.data_pedido}}</div>
                <div class="font-weight-bold" v-if="selecionado.origin === '2'">
                  <span class="badge badge-info">Realizado pelo LeCard Geral</span>
                </div>
              </div>
              <div v-show="selecionado.obs_cancelamento && selecionado.status === '5'">
                <span><b class="text-danger">Cancelado:</b> {{selecionado.obs_cancelamento}}</span>
              </div>
              <h6 v-show="selecionado.id_entrega">
                <b class="text-danger">AGENDADO PARA:</b> {{selecionado.data_agendamento}}
              </h6>
              <h6 v-show="!selecionado.id_entrega && selecionado.tipo_pedido === '1' && selecionado.previsao_entrega">
                Previsão de entrega: <b>{{selecionado.previsao_entrega}}</b>
              </h6>
              <h6 v-show="selecionado.tipo_pedido === '2' && selecionado.previsao_retirada">
                Previsão de retirada: <b>{{selecionado.previsao_retirada}}</b>
              </h6>
              <div class="border p-2 mt-3 mb-2">
                <h5 class="font-weight-bold m-0">{{selecionado.cliente.nome_cliente}}</h5>
                <div v-if="selecionado.origin !== '3'">
                  Nº de Pedidos: {{selecionado.qtd_pedidos === '0' ? 'Primeiro pedido' : selecionado.qtd_pedidos + ' pedidos'}}
                </div>
                <div class="mt-1" v-if="selecionado.tipo_pedido === '1'">
                  <h6 class="text-success font-weight-bold m-0">Entregar em:</h6>
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
                  <h6 class="text-info font-weight-bold m-0">Retirar no local</h6>
                  <div>
                    Cliente vai retirar o pedido
                  </div>
                  <b>Telefone: </b>
                  <a :href="'https://api.whatsapp.com/send?phone=+55'+ selecionado.cliente.telefone" class="text-info" target="_blank">
                    <b>{{selecionado.cliente.telefone | phone}}</b>
                  </a>
                </div>
                <div class="mt-1" v-else="selecionado.tipo_pedido === '3'">
                  <h6 class="text-warning font-weight-bold m-0">Consumir no Local</h6>
                  <div>
                    Cliente vai consumir o pedido no local
                  </div>
                  <b>Mesa/Cliente: </b> {{selecionado.obs_pedido}}
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
                  <span class="float-right">{{selecionado.id_pagamento | pagamento}}</span>
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
              <div v-if="selecionado.obs_pedido"><b>Obs:</b> {{selecionado.obs_pedido}}</div>
              <div v-if="selecionado.troco > 0"><b>Obs:</b> Troco para R${{(selecionado.troco) | valor}}</div>
            </div>
          </div>
          <div class="container-aceitar bg-white">
            <div class="container-fluid">
              <div class="row pt-2 pb-2">
                <div class="col-3">
                  <button class="btn btn-outline-secondary btn-block" :disabled="!selecionado.status" @click="imprimir()" >Imprimir</button>
                </div>
                <div class="col-3" v-show="['1','2','3'].includes(selecionado.status)">
                  <button class="btn btn-danger btn-block" @click="openModalCancelamento">{{selecionado.status === '1' ? 'Recusar' : 'Cancelar'}}</button>
                </div>
                <div class="col-6 text-right" v-show="selecionado.status === '1'">
                  <button class="btn btn-success btn-block" @click="acaoPedido(2)">Aceitar</button>
                </div>
                <div class="col-6 text-right" v-show="selecionado.status === '2'">
                  <button class="btn btn-dark btn-block" @click="acaoPedido(3)">{{selecionado.tipo_pedido === '1' ? 'Enviar p/ Entrega' : 'Pronto para retirar'}}</button>
                </div>
                <div class="col-6 text-right" v-show="selecionado.status === '3'">
                  <button class="btn btn-info btn-block" @click="acaoPedido(4)">Finalizar</button>
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
const { ipcRenderer } = require('electron');
const Config = require('electron-config');
const config = new Config();

import TopBar from '@/components/TopBar.vue'
import HelloWorld from '@/components/HelloWorld.vue'
import Modal from '../components/Modal'

export default {
  name: 'Pedidos',
  components: {
    Modal,
    HelloWorld, TopBar
  },
  data() {
    return {
      loading: true,
      imprimirSelecionado: false,
      pedidos: [],
      pesquisa: {
        status: 1,
        keys: []
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
        qtd: 0
      },
      empresas: []
    }
  },

  methods: {
    buscarPedidos(play) {
      this.loading = true;

      this.$http.get('delivery/pedidos', {params: this.pesquisa})
        .then(response => {
          if (!response.data) {
            return;
          }

          this.pedidos = response.data.pedidos;
          this.totais = response.data.totais;

          if (this.pedidos.length > 0) {
            let existe = false;

            this.pedidos.forEach(obj => {
              if (obj.id_pedido === this.selecionado.id_pedido) {
                this.selecionado = obj;
                this.$nextTick(function () {
                  if (this.imprimirSelecionado) {
                    this.imprimirSelecionado = false;
                    this.imprimir(localStorage.getItem('nCopias'));
                  }
                });
                existe = true;
              }
            });

            if (!existe) {
              this.selecionado = this.pedidos[0];
              this.$nextTick(function () {
                if (this.imprimirSelecionado) {
                  this.imprimirSelecionado = false;
                  this.imprimir(localStorage.getItem('nCopias'));
                }
              });
            }

            if (play) {
              this.pedidos.find(p => p.status === '1' && !p.id_entrega) ? this.$emit('playNotification') : '';
            }

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
      this.$http.post('delivery/pedidos/' + empresa.key, dados, {emulateJSON: true})
        .then(res => {
          this.$socket.emit('notification', {token: empresa.token, play: false});
          if (res.data && status === 2 && localStorage.getItem('impressaoAutomatica') === '1') {
            this.imprimirSelecionado = true;
          }

          this.motivoRecusa = '';
          dados.socket_id = this.selecionado.cliente.id_cliente + (this.selecionado.origin === '2' ? 'lecard_app_geral' : empresa.token);
          this.$socket.emit('delivery_status', dados);

          this.buscarPedidos();

        }, res => {
          this.loading = false;
          console.log(res);
          if (res.status === 401) {
            ipcRenderer.send('reload');
          }
        });
    },

    imprimir(ncopias) {
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
    padding-right: 16px;
  }
  .coluna-1 .coluna-1-1 {
    position: absolute; top: 28px; bottom: 62px; right: 16px; left: 0; overflow: auto; margin-top: 18px; padding: 0
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
</style>
