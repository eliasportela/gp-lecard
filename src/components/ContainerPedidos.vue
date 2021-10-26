<template>
  <div>
    <div class="container-pedidos">
      <div class="coluna-1">
        <div class="row no-gutters mb-2" v-if="pesquisa.nolocal !== '3'">
          <div class="col-6 pr-1">
            <select class="form-control" v-model="pesquisa.status" @change="filtrarPedidos()" :disabled="loading">
              <option value="1">Em andamento</option>
              <option value="4">Finalizados</option>
              <option value="5">Cancelados</option>
            </select>
          </div>
          <div class="col-6 pl-1">
            <select class="form-control" v-model="pesquisa.nolocal" @change="buscarNoLocal()" :disabled="loading">
              <option value="1">Todos</option>
              <option value="2">No Local</option>
              <option value="3">Filtrar Data</option>
              <option value="4">Finalizar em Massa</option>
            </select>
          </div>
        </div>
        <div class="row no-gutters mb-2" v-else>
          <div class="col-7 pr-1">
            <input type="date" id="noLocal" class="form-control" v-model="pesquisa.data" @change="filtrarPedidos()">
          </div>
          <div class="col-5 pl-1">
            <button class="btn btn-dark btn-block" @click="clearPesquisa()">Voltar</button>
          </div>
        </div>
        <div class="bg-white coluna-1-1 border">
          <div>
            <a href="javascript:" :id="'listPedido' + p.id_pedido" class="d-flex justify-content-between border-bottom px-2 py-2 text-decoration-none text-dark"
                 v-for="(p, i) in pedidos" :key="i" @click="buscarPedidoId(p)" :class="{'bg-selecionado' : selecionado.id_pedido === p.id_pedido}">
              <div>
                <h6 class="mb-0">{{p.nome_cliente}}</h6>
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
        <div class="container-aceitar bg-white" style="left: 0; right: 8px; width: auto" v-if="!loadPedidos">
          <div class="card p-2 small">
            <div class="d-flex justify-content-between" v-if="pesquisa.nolocal !== '3'">
              <div>
                <div class="font-weight-bold m-0">APP Delivery ({{totais.quantidade}})</div>
                <div class="text-muted">R$ {{totais.total | valor}}</div>
              </div>
              <div class="text-right">
                <div class="font-weight-bold m-0">No Local ({{nolocal.quantidade}})</div>
                <div class="text-muted">R$ {{nolocal.total | valor}}</div>
              </div>
            </div>
            <div class="text-right" v-else>
              <button class="btn btn-dark" @click="imprimirResumo()" :disabled="!pedidos.length || loadResumo" style="width: 100px">
                {{loadResumo ? 'Aguarde..' : 'Imprimir'}}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="coluna-2">
        <div class="conteudo-c2 border">
          <div v-if="loading" style="padding-top: 28vh">
            <img src="../assets/logo-lecard.png" class="d-block m-auto animated flipInY infinite" alt="Logo Lecard" style="width: 72px;">
          </div>
          <div v-show="!loading">
            <div class="container-produtos" v-show="!selecionado.cliente">
              <msg-home class="mt-1"/>
            </div>
            <div id="containerPedido" class="container-produtos" v-if="selecionado.cliente">
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
              <div class="p-3 mt-3 mb-2 bg-warning rounded d-print-none" v-if="selecionado.suspeito === '1'">
                <h6 class="font-weight-bold m-0">PEDIDO SUSPEITO!</h6>
                <div>
                  Recomendamos entrar em contato pelo número do telefone do cliente antes de aceitar este pedido.
                </div>
              </div>
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
              <div class="border p-2 pb-0 my-2 d-print-none">
                <h6 class="font-weight-bold mb-2">Etiquetas</h6>
                <div class="d-flex flex-wrap">
                  <div class="badge badge-info p-2 mr-2 mb-1 pointer" title="Cliente Novo"
                       v-if="selecionado.is_new === '1'" @click="modalTag = true">
                    Novo
                  </div>
                  <div class="badge text-white p-2 mr-2 mb-1 pointer" :title="'Cliente ' + t.nome_tag" v-if="selecionado.tags && selecionado.tags.length"
                       v-for="t in selecionado.tags" :class="'badge-' + t.color" @click="modalTag = true">
                    {{t.nome_tag}}
                  </div>
                  <div class="mb-1">
                    <button class="btn btn-light p-0 px-2" style="" @click="modalTag = true">
                      &plus;
                    </button>
                  </div>
                </div>
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
                  <div class="mr-1">
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
                      <div class="small mt-1">Ver mapa</div>
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
                <div v-if="selecionado.tipo_pedido === '1'">
                  <span class="float-right">R$ {{selecionado.valor_frete | valor}}</span>
                  Taxa de Entrega:
                </div>
                <div>
                  <span class="float-right">R$ {{selecionado.valor_desconto | valor}}</span>
                  Desconto:
                </div>
                <div v-if="selecionado.ref_cupom">
                  <b class="float-right">{{selecionado.ref_cupom}}</b>
                  Cupom:
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
        <div class="mb-2">
          <label for="motivoCancelamento" class="small mb-0"><b>Motivo do cancelamento*</b></label>
          <select id="motivoCancelamento" class="form-control" style="max-width: 300px" v-model="cancelamento.tipo_cancelamento" @change="changeCancelamento">
            <option :value="r.id" v-for="r in motivosRecusa">{{r.obs}}</option>
          </select>
        </div>
        <div>
          <label class="small mb-0"><b>Motivo do cancelamento (min 6 letras)*</b></label>
          <textarea id="textCancelamento" class="form-control mb-4" rows="5" placeholder="Informe o motivo para recusar este pedido" style="resize: none" v-model="cancelamento.obs_cancelamento" :disabled="!cancelamento.tipo_cancelamento"></textarea>
        </div>
        <div class="container-fluid">
          <div class="row">
            <div class="col-md-6">
              <button class="btn btn-dark btn-block rounded-sm" @click="modalCancelamento = false">Voltar</button>
            </div>
            <div class="col-md-6">
              <button class="btn btn-danger btn-block rounded-sm" @click="acaoPedido(5)" :disabled="cancelamento.obs_cancelamento.length < 6"><b>Confirmar</b></button>
            </div>
          </div>
        </div>
      </modal>

      <modal :opened="modalTag" width="tiny">
        <h6 class="pointer text-center">Etiquetas</h6>
        <div class="my-4">
          <div class="mb-2 text-white p-2 rounded-sm pointer d-flex justify-content-between align-items-center"
               v-for="t in tags" :class="'bg-' + t.color" @click="toggleTag(t)">
            {{t.nome_tag}}
            <i class="mr-2" v-if="selecionado.tags.find(tag => tag.id_tag === t.id_tag)">&check;</i>
          </div>
        </div>
        <div class="border-top pt-3 text-center">
          <button class="btn btn-dark rounded-sm" @click="modalTag = false">Voltar</button>
        </div>
      </modal>

      <modal :opened="modalMapa" width="full">
        <div class="container-fluid border-bottom pb-2">
          <button class="btn btn-outline-danger" style="margin-top: 10px" @click="modalMapa = false">Voltar</button>
        </div>
        <map-leaflet />
      </modal>

      <div id="resumoDiario">
        <div class="text-center mb-2">
          <h5 class="m-0 font-weight-bold">Resumo Diário</h5>
          <div>Data: {{resumo.data_pedido}}</div>
        </div>
        <hr>
        <div class="border p-2 mb-3">
          <div>
            <span class="float-right">{{resumo.operacao.delivery}}</span>
            Entregas:
          </div>
          <div>
            <span class="float-right">{{resumo.operacao.retirada}}</span>
            Retiradas:
          </div>
          <div>
            <span class="float-right">{{resumo.operacao.nolocal}}</span>
            No Local:
          </div>
        </div>
        <div class="font-weight-bold mb-2">Pagamentos</div>
        <div class="border p-2 mb-2">
          <div v-for="p in resumo.pagamentos">
            <span class="float-right">R$ {{p.total}}</span>
            {{p.nome_pagamento}}:
          </div>
          <hr>
          <div>
            <span class="float-right">{{resumo.cancelados.qtd}}</span>
            Cancelados:
          </div>
          <div>
            <span class="float-right font-weight-bold">{{resumo.finalizados.qtd}}</span>
            Pedidos:
          </div>
          <div>
            <span class="float-right font-weight-bold">R$ {{resumo.finalizados.total}}</span>
            <b>Total:</b>
          </div>
        </div>
      </div>

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
      loadPedidos: false,
      loading: false,
      pedidos: [],
      pesquisa: {
        status: '1',
        nolocal: '1',
        keys: [],
        data: ''
      },
      selecionado: {
        produtos: [],
        tags: [],
        troco: 0,
        total: 0
      },
      modalCancelamento: false,
      modalMapa: false,
      modalTag: false,

      motivosRecusa: [
        {id: null, obs: 'Selecione um motivo'},
        {id: '10', obs: 'Cliente solicitou cancelamento'},
        {id: '11', obs: 'Produto(s) em falta'},
        {id: '12', obs: 'A loja já está fechada'},
        {id: '13', obs: 'Duplicidade de pedidos'},
        {id: '1', obs: 'Outros'}
      ],

      cancelamento: {
        tipo_cancelamento: null,
        obs_cancelamento: ''
      },

      socket: true,
      totais: {
        total: 0,
        quantidade: 0
      },
      nolocal: {
        total: 0,
        quantidade: 0
      },
      empresas: [],

      loadResumo: false,
      resumo: {
        data_pedido: "22/06/2021",
        finalizados: { total:"107.50", qtd:"3" },
        cancelados: { total:"147.00", qtd:"8" },
        operacao: { delivery:"3", retirada:"0", nolocal:"0" },
        pagamentos: [
          {
            nome_pagamento: "Cartão de Débito",
            total: "52.50"
          },
          {
            nome_pagamento: "Pix",
            total: "55.00"
          }
        ]
      },

      impressora: {
        automatico: '',
        nCopias: ''
      },

      tags: []
    }
  },

  methods: {
    filtrarPedidos() {
      this.clearPedido();
      this.buscarPedidos(false);
    },

    buscarNoLocal() {
      switch (this.pesquisa.nolocal) {
        case '1':
          this.clearPedido();
          this.buscarPedidos(false);
          break;

        case '2':
          this.clearPedido();
          this.pedidos = this.pedidos.filter(p => p.origin === '4');
          break;

        case '3':
          this.clearPedido();
          this.pesquisa.status = '4';
          this.pesquisa.data = new Date().toDateInputValue();
          setTimeout(() => { document.getElementById("noLocal").focus() }, 200);
          this.buscarPedidos(false);
          break;

        case '4':
          this.pesquisa.nolocal = '1';

          this.$swal({
            text: "Deseja finalizar todos os pedidos que estão com o status 'Preparando' ou 'Entregando'?",
            buttons: ["Cancelar", "Sim"],
            dangerMode: true
          }).then(res => {
            if (res) {
              this.finalizarEmMassa();
            }
          });

          break;
      }
    },

    clearPesquisa() {
      this.pesquisa.status = '1';
      this.pesquisa.nolocal = '1';
      this.pesquisa.data = '';
      this.pedidos = [];
      this.buscarPedidos(false);
    },

    buscarPedidos(play) {
      if (this.loadPedidos || this.loading) {
        return;
      }

      if (this.pesquisa.nolocal === '2') {
        this.pesquisa.nolocal = '1';
      }

      this.loadPedidos = true;
      this.loading = true;

      this.$http.get('v2/pedidos', {params: this.pesquisa})
        .then(response => {
          if (!response.data) {
            return;
          }

          this.pedidos = response.data.pedidos;
          this.totais = response.data.totais;

          if (response.data.nolocal) {
            this.nolocal = response.data.nolocal;
          }

          this.loadPedidos = false;
          this.loading = false;

          if (this.pedidos.length > 0) {
            if (play && this.pedidos.find(p => p.status === '1' && !p.id_entrega)) {
              this.$store.commit('setBell', true);
              this.playNotification();
            }

            if (this.selecionado.id_pedido) {
              this.buscarPedidoId(this.selecionado);

            } else {
              this.buscarPedidoId(this.pedidos[0]);
            }

            this.$emit('ativarEmpresa');

          } else {
            this.clearPedido();
          }

        }, res => {
          console.log(res);
          this.loading = false;
          this.loadPedidos = false;

          if (res.status === 401) {
            ipcRenderer.send('reload');

          } else if (!navigator.onLine) {
            this.$swal("Não conseguimos acessar sua conexão com a internet. Por favor verifique se seu computador tem uma conexão estável.");
          }
        });
    },

    buscarPedidoId(dados, callback, scroll) {
      if (this.loading) {
        return;
      }

      const empresa = this.empresas.find(e => e.token === dados.token);

      if (!empresa) {
        return;
      }

      this.selecionado.id_pedido = dados.id_pedido;
      this.loading = true;

      this.$http.get('delivery/pedidos/' + empresa.key + '/' + dados.id_pedido)
        .then(response => {
          this.loading = false;

          if (!response.data) {
            return;
          }

          this.selecionado = response.data;
          this.$nextTick(() => {
            if (callback) {
              callback()
            }
          });

          const p = this.pedidos.find(p => p.id_pedido === dados.id_pedido);

          if (p) {
            p.status = this.selecionado.status;
            p.is_late = this.selecionado.is_late;
            p.previsao = this.selecionado.previsao;
          }

          if (this.pesquisa.status === '1' && this.selecionado.status === '4') {

            this.pedidos = this.pedidos.filter(p => p.id_pedido !== dados.id_pedido);

            if (this.pedidos.length) {
              const p = this.pedidos[scroll ? (this.pedidos.length - 1) : 0];
              this.buscarPedidoId(p);

              if (scroll) {
                this.scrollPedido(p.id_pedido);
              }

            } else {
              this.clearPedido()
            }
          }

          this.validarPedidoSuspeito();

        }, res => {
          console.log(res);
          this.loading = false;

          if (res.status === 401) {
            ipcRenderer.send('reload');

          } else if (!navigator.onLine) {
            this.$swal("Não conseguimos acessar sua conexão com a internet. Por favor verifique se seu computador tem uma conexão estável.");
          }
        });
    },

    validarPedidoSuspeito() {
      if (this.selecionado.suspeito === '1') {
        this.$swal({
          icon: 'warning',
          title: "Pedido Suspeito!",
          text: "De acordo com nosso sistema esse pedido foi considerado suspeito. Recomendamos entrar em contato pelo número do telefone do cliente antes de aceitar o pedido.",
          buttons: ["Ok, eu entendo", "Não é suspeito"],
        }).then(res => {
          if (res) {
            this.selecionado.suspeito = '0';
            const tag = this.selecionado.tags.find(t => t.id_tag === '2');

            if (tag) {
              this.$swal({
                text: "Deseja marcar este cliente como não suspeito?",
                buttons: ["Não", "Sim"]
              }).then(res => {
                if (res) {
                  this.toggleTag(tag);
                }
              });
            }
          }
        });
      }
    },

    clearPedido() {
      this.selecionado = {
        tags: [],
        produtos: [],
        troco: 0,
        total: 0
      };
    },

    scrollPedido(id_pedido) {
      const el = document.getElementById('listPedido' + id_pedido);
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
        tipo_cancelamento: this.cancelamento.tipo_cancelamento,
        obs_cancelamento: this.cancelamento.obs_cancelamento
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
          this.loading = false;
          this.$socket.emit('notification', {token: empresa.token, play: false});

          if (this.selecionado.cliente) {
            dados.socket_id = this.selecionado.cliente.id_cliente + (this.selecionado.origin === '2' ? 'lecard_app_geral' : empresa.token);
            this.$socket.emit('delivery_status', dados);
          }

          this.cancelamento.tipo_cancelamento = null;
          this.cancelamento.obs_cancelamento = '';

          if (res.data) {
            if (status === 5) {
              this.$swal("Cancelamento realizado com sucesso!");
            }

            this.buscarPedidoId(this.selecionado, () => {
              if (status === 2 && this.impressora.automatico === '1') {
                this.imprimir(this.impressora.nCopias);
              }
            }, true);
          }

        }, res => {
          this.loading = false;
          const data = res.data;

          if (data && data.status == 1) {
            this.$swal(data.msg).then(() => {
              this.buscarPedidos(false);
            });
          }

          console.log(res);
          if (res.status === 401) {
            ipcRenderer.send('reload');
          }
        });
    },

    finalizarEmMassa() {
      if (this.loading) {
        return;
      }

      this.loading = true;

      this.$http.post('v2/pedidos/finalizar', this.pesquisa)
        .then(res => {
          this.loading = false;
          this.$swal("Pedidos finalizados com sucesso!");
          this.clearPedido();
          this.buscarPedidos(false);

        }, res => {
          console.log(res);
          this.loading = false;
          this.$swal(res.data.msg ? res.data.msg : 'Erro temporário');
        });
    },

    imprimir(ncopias) {
      if (!this.selecionado.id_pedido) {
        return;
      }

      ipcRenderer.send('print', {
        content: document.getElementById('containerPedido').innerHTML,
        copies: ncopias ? ncopias : 1
      });
    },

    imprimirResumo() {
      if (!this.pedidos.length) {
        this.$swal("Não há pedidos neste dia");
        return;
      }

      if (this.loadResumo) {
        return;
      }

      this.loadResumo = true;
      this.$http.get('delivery/relatorio-gestor', {params: this.pesquisa})
        .then(response => {
          if (!response.data) {
            return;
          }

          this.resumo = response.data;
          this.$nextTick(() => {
            if (this.resumo.data_pedido) {
              const options = {
                content: document.getElementById('resumoDiario').innerHTML,
                copies: 1
              };

              ipcRenderer.send('print', options);

              setTimeout(() => {
                this.loadResumo = false;
              }, 1000);

            } else {
              this.$swal("Não há pedidos neste dia");
              this.loadResumo = false;
            }
          });

        }, res => {
          console.log(res);
          this.loadResumo = false;
        });
    },

    openModalCancelamento() {
      this.modalCancelamento = true;
      this.cancelamento.tipo_cancelamento = null;
      this.cancelamento.obs_cancelamento = '';

      this.$store.commit('setBell', false);
      this.pauseNotification();

      setTimeout(() => {
        document.getElementById('textCancelamento').focus()
      }, 500)
    },

    changeCancelamento() {
      const motivo = this.motivosRecusa.find(m => m.id === this.cancelamento.tipo_cancelamento);
      this.cancelamento.obs_cancelamento = motivo && this.cancelamento.tipo_cancelamento !== '1' ? motivo.obs : '';

      setTimeout(() => {
        document.getElementById("textCancelamento").focus();
      }, 200);
    },

    openMapa() {
      this.modalMapa = true;
      const pedidos = []; // TODO buscar no BD todos os pedidos com latotude
      let pedido = null;

      if (this.selecionado.cliente.lat_endereco) {
        pedido = {
          id_pedido: this.selecionado.id_pedido,
          lat_endereco: this.selecionado.cliente.lat_endereco,
          long_endereco: this.selecionado.cliente.long_endereco
        }
      }

      this.pedidos.forEach((p) => {
        if (p.lat_endereco) {
          pedidos.push({
            id_pedido: p.id_pedido,
            status: p.status,
            data_pedido: p.data_pedido,
            origin: p.origin,
            id_entrega: p.id_entrega,
            nome_cliente: p.nome_cliente,
            logradouro: p.logradouro,
            numero: p.numero,
            bairro: p.bairro,
            lat_endereco: p.lat_endereco,
            long_endereco: p.long_endereco
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
    },

    getTags() {
      this.$http.get('clientes/tags/dados')
        .then(response => {
          this.tags = response.data;

        }, res => {
          this.$swal(res.data.result, res.data.msg);
        });
    },

    toggleTag(t) {
      if (!this.selecionado.tags.find(tag => tag.id_tag === t.id_tag)) {
        this.selecionado.tags.push({
          nome_tag: t.nome_tag,
          id_tag: t.id_tag,
          color: t.color,
        })

      } else {
        this.selecionado.tags = this.selecionado.tags.filter(tag => tag.id_tag !== t.id_tag)
      }

      this.salvarTag();
    },

    salvarTag() {
      const empresa = this.empresas.find(e => e.token === this.selecionado.token);

      if (!empresa) {
        return;
      }

      const dados = { id_cliente: this.selecionado.id_cliente, tags: this.selecionado.tags };

      this.$http.post('clientes/tags/' + empresa.key, dados)
        .then(res => {}, res => {
          this.$swal(res.data.msg);
        });
    }
  },

  mounted() {
    if (!localStorage.getItem('key')) {
      return;
    }

    this.empresas = config.get('empresas') ? config.get('empresas') : [];
    this.impressora = config.get('impressora') ? config.get('impressora') : {};

    this.pesquisa.keys = this.empresas.map(e => {
      return e.key
    });

    this.buscarPedidos(true);
    this.getTags();
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

  #resumoDiario {
    display: none;
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
