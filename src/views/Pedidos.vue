<template>
  <div>
    <top-bar @delivery_order="buscarPedidos" @delivery_desativado="deliveryDesativado"/>
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
                <span class="small font-weight-bold bg-danger text-white rounded-sm px-1 float-right" v-show="p.status === '1'">Em andamento</span>
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
                <div class="col-12 py-2" v-if="totais.quantidade">
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
              <div id="andamento" class="small font-weight-bold float-right" v-show="!selecionado.id_entrega">
                <span class="bg-danger text-white rounded-sm px-1" v-show="selecionado.status === '1'">Em andamento</span>
                <span class="bg-info text-white rounded-sm px-1" v-show="selecionado.status === '2'">Preparando</span>
                <span class="bg-dark text-white rounded-sm px-1" v-show="selecionado.status === '3'">Entregando</span>
                <span class="bg-dark text-white rounded-sm px-1" v-show="selecionado.status === '4'">Finalizado</span>
                <span class="bg-danger text-white rounded-sm px-1" v-show="selecionado.status === '5'">Cancelado</span>
              </div>
              <div class="small font-weight-bold float-right" v-show="selecionado.id_entrega">
                <span class="bg-warning text-white rounded-sm px-1">Pedido Agendado</span>
              </div>
              <h6>Pedido: {{selecionado.id_pedido}} - {{selecionado.data_pedido}}</h6>
              <div v-show="selecionado.obs_cancelamento && selecionado.status === '5'">
                <span><b class="text-danger">Cancelado:</b> {{selecionado.obs_cancelamento}}</span>
              </div>
              <h5 class="font-weight-bold">{{selecionado.cliente.nome_cliente}}</h5>
              <h6 v-show="selecionado.id_entrega">
                Pedido Agendado: <b>{{selecionado.data_agendamento}}</b>
              </h6>
              <h6 class="m-0">
                Pedidos: {{selecionado.qtd_pedidos === '0' ? 'Primeiro pedido' : selecionado.qtd_pedidos + ' pedidos'}}
              </h6>
              <h6 v-show="!selecionado.id_entrega && selecionado.tipo_pedido === '1' && selecionado.previsao_entrega">
                Previsão de entrega: <b>{{selecionado.previsao_entrega}}</b>
              </h6>
              <h6 v-show="selecionado.tipo_pedido === '2' && selecionado.previsao_retirada">
                Previsão de retirada: <b>{{selecionado.previsao_retirada}}</b>
              </h6>
              <div class="border p-2 mt-3 mb-2" v-show="selecionado.tipo_pedido === '1'">
                <h6 class="text-success font-weight-bold">Entregar em:</h6>
                <div>
                  {{selecionado.cliente.endereco}}, {{selecionado.cliente.numero}}, {{selecionado.cliente.bairro}} - {{selecionado.cliente.nome_cidade}} <br>
                  CEP: {{selecionado.cliente.cep}}
                  <span v-show="selecionado.cliente.complemento">-</span>
                  {{selecionado.cliente.complemento}}
                  <br>
                  <b>Telefone:</b> {{selecionado.cliente.telefone | phone}} <br>
                </div>
              </div>
              <div class="border p-2 mt-3 mb-2" v-show="selecionado.tipo_pedido === '2'">
                <h6 class="text-info font-weight-bold">Retirar no local</h6>
                <div>
                  Cliente vai retirar o pedido
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
                  <span class="float-right">{{selecionado.id_pagamento === '1' ? 'Dinheiro' : 'Cartão'}}</span>
                  Forma de Pagamento:
                </div>
                <div>
                  <span class="float-right font-weight-bold">R$ {{selecionado.total | valor}}</span>
                  <b>Cobrar do Cliente:</b>
                </div>
              </div>
              <div v-show="selecionado.obs_pedido"><b>Obs:</b> {{selecionado.obs_pedido}}</div>
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
      empresa: localStorage.getItem('empresa'),
      urlBase: localStorage.getItem('urlBase'),
      token: localStorage.getItem('key'),
      loading: true,
      imprimirSelecionado: false,
      pedidos: [],
      pesquisa: {
        status: 1,
        display: true
      },
      selecionado: {
        produtos: [],
        total: 0
      },
      modalCancelamento: false,
      motivoRecusa: '',
      socket: true,
      totais: '',
    }
  },

  methods: {
    buscarPedidos() {
      this.loading = true;

      this.$http.get(this.urlBase + 'delivery/pedidos/' + this.empresa, {params: this.pesquisa})
        .then(response => {
          this.pedidos = response.data;
          if (this.pedidos.length > 0) {
            let existe = false;

            this.pedidos.forEach(obj => {
              if (obj.id_pedido === this.selecionado.id_pedido) {
                this.selecionado = obj;
                existe = true;
              }
            });

            if (!existe) {
              this.selecionado = this.pedidos[0];
            }

            if (this.imprimirSelecionado) {
              this.imprimirSelecionado = false;
              setTimeout(() => {
                this.imprimir();
              }, 1000);
            }

          } else {
            this.selecionado = {
              produtos: [],
              total: 0
            }
          }

          this.loading = false;
          this.buscarTotais();

        }, res => {
          console.log(res);
          if (res.status === 401) {
            this.$swal(res.data.msg ? res.data.msg : 'Erro temporário');
            localStorage.removeItem('key');
            this.$router.push('/')
          }
        });
    },

    buscarTotais() {
      this.$http.get(this.urlBase + 'delivery/relatorio-diario/'  + this.token)
        .then(response => {
          this.totais = response.data;
          // console.log(response);
        }, res => {
          // openModalMsg(res.data.result,res.data.msg);
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

      // console.log(dados);
      this.$http.post(this.urlBase + 'delivery/pedidos/' + this.token, dados, {emulateJSON: true})
        .then(res => {
          this.$emit('notification');

          if (res.data && status === 2) {
            this.$socket.emit('notification', {token: this.empresa, play: false});

            if (localStorage.getItem('impressaoAutomatica')) {
              this.imprimirSelecionado = true;
            }
          }

          this.motivoRecusa = '';
          this.$socket.emit('delivery_status', this.selecionado);

          this.buscarPedidos();

        }, res => {
          this.loading = false;
          console.log(res);
          if (res.status === 401) {
            this.$emit('logout');
          }
        });
    },

    imprimir() {
      let options = {
        content: document.getElementById('containerPedido').innerHTML,
        copies: localStorage.getItem('nCopias') ? localStorage.getItem('nCopias') : 1
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
    this.buscarPedidos();
    this.buscarTotais();
  },

  created() {
    ipcRenderer.on('print-return', (event, arg) => {
      console.log(arg);
    });
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
    padding: 12px 12px 70px;
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