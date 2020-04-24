<template>
  <div>
    <top-bar @delivery_order="buscarPedidos"/>
    <div style="height: 100vh; margin-left: 70px; position: relative;">
      <div class="container-pedidos">
        <div class="coluna-1">
          <select class="form-control" v-model="pesquisa.status" @change="buscarPedidos">
            <option value="1">Em andamento</option>
            <option value="4">Finalizados</option>
            <option value="5">Cancelados</option>
          </select>
          <div class="bg-white coluna-1-1 border">
            <div class="mt-2" v-show="!loading">
              <div class="border-bottom p-2 pointer" v-for="p in pedidos" @click="selecionado = p" :class="{'bg-light' : selecionado.id_pedido === p.id_pedido}">
                <span class="small font-weight-bold bg-danger text-white rounded-sm px-1 float-right" v-show="p.status === '1'">Em andamento</span>
                <span class="small font-weight-bold bg-info text-white rounded-sm px-1 float-right" v-show="p.status === '2'">Preparando</span>
                <span class="small font-weight-bold bg-dark text-white rounded-sm px-1 float-right" v-show="p.status === '3'">Entregando</span>
                <span class="small font-weight-bold bg-dark text-white rounded-sm px-1 float-right" v-show="p.status === '4'">Finalizado</span>
                <span class="small font-weight-bold bg-danger text-white rounded-sm px-1 float-right" v-show="p.status === '5'">Cancelado</span>
                <h6 class="mb-0">Pedido: {{p.id_pedido}}</h6>
                <span class="small">{{p.data_pedido}}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="coluna-2">
          <div class="conteudo-c2 border">
            <div class="" style="display: flex; height: 90%; justify-content: center; align-items: center;" v-show="selecionado.produtos.length === 0">
              <div v-show="loading">
                <img src="../assets/logo-lecard.png" class="d-block m-auto animated flipInY infinite" alt="Logo Lecard" style="width: 64px;">
              </div>
              <div v-show="!loading"><b>Selecione um pedido</b></div>
            </div>
            <div id="containerPedido" class="container-produtos" v-if="selecionado.cliente" v-show="!loading && selecionado.produtos.length > 0">
              <div id="andamento" class="small font-weight-bold float-right">
                <span class="bg-danger text-white rounded-sm px-1" v-show="selecionado.status === '1'">Em andamento</span>
                <span class="bg-info text-white rounded-sm px-1" v-show="selecionado.status === '2'">Preparando</span>
                <span class="bg-dark text-white rounded-sm px-1" v-show="selecionado.status === '3'">Entregando</span>
                <span class="bg-dark text-white rounded-sm px-1" v-show="selecionado.status === '4'">Finalizado</span>
                <span class="bg-danger text-white rounded-sm px-1" v-show="selecionado.status === '5'">Cancelado</span>
              </div>
              <h6>Pedido: {{selecionado.id_pedido}} - {{selecionado.data_pedido}}</h6>
              <div v-show="selecionado.obs_cancelamento && selecionado.status === '5'">
                <span><b class="text-danger">Cancelado:</b> {{selecionado.obs_cancelamento}}</span>
              </div>
              <h5 class="font-weight-bold">{{selecionado.cliente.nome_cliente}}
                <span class="small font-weight-bold">({{selecionado.qtd_pedidos === '0' ? 'Primeiro pedido' : selecionado.qtd_pedidos + ' pedidos'}})</span>
              </h5>
              <h6 v-show="selecionado.previsao_entrega">Previsão de entrega: <b>{{selecionado.previsao_entrega}}</b></h6>
              <div class="border p-2 mt-3">
                <h6 class="text-success font-weight-bold">Entregar em:</h6>
                <div>
                  {{selecionado.cliente.endereco}}, {{selecionado.cliente.numero}}, {{selecionado.cliente.bairro}} - {{selecionado.cliente.nome_cidade}} <br>
                  CEP: {{selecionado.cliente.cep}} - {{selecionado.cliente.complemento}} <br>
                  <b>Telefone:</b> {{selecionado.cliente.telefone}} <br>
                </div>
              </div>
              <div class="mt-4">
                <div class="border-bottom p-2 pb-4" v-for="i in selecionado.produtos">
                  <span class="small bg-dark text-white rounded-sm px-1 float-right"><b>R$ {{i.valor | valor}}</b></span>
                  <h6 class="mb-0">{{i.quantidade}}x {{i.produto.nome_produto}}</h6>
                  <div class="small" v-for="d in i.divisoes">
                    - {{d.nome_produto}}
                  </div>
                  <div class="small" v-for="d in i.adicionais">
                    - {{d.nome_produto}} <span v-show="d.valor > 0">R$ {{d.valor | valor}}</span>
                  </div>
                  <div class="small" v-show="i.observacao">
                    - Obs: {{i.observacao}}
                  </div>
                </div>
                <div class="mt-3">
                  <div class="text-right">
                    <div><b>Taxa de entrega:</b> R$ {{selecionado.valor_frete | valor}}</div>
                    <div><b>Desconto:</b> R$ {{selecionado.valor_desconto | valor}}</div>
                    <div><b>Cobrar do cliente: R$ {{selecionado.total | valor}}</b></div>
                  </div>
                  <div class="mt-4"><b>Forma de Pagamento:</b> {{selecionado.id_pagamento === '1' ? 'Dinheiro' : 'Cartão'}}</div>
                  <div v-show="selecionado.obs_pedido"><b>Obs:</b> {{selecionado.obs_pedido}}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="container-aceitar border-top bg-white">
            <div class="container-fluid">
              <div class="row pt-3 pb-2">
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
                  <button class="btn btn-dark btn-block" @click="acaoPedido(3)">Enviar p/ Entrega</button>
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
      socket: true
    }
  },

  methods: {
    buscarPedidos() {
      this.loading = true;

      this.$http.get('delivery/pedidos/' + this.empresa, {params: this.pesquisa})
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

        }, res => {
          console.log(res);
          if (res.status === 401) {
            this.$swal(res.data.msg ? res.data.msg : 'Erro temporário');
            localStorage.removeItem('key');
            this.$router.push('/')
          }
        });
    },

    acaoPedido(status) {
      this.modalCancelamento = false;
      this.selecionado.status = status;
      this.selecionado.obs_cancelamento = this.motivoRecusa;
      this.loading = true;

      this.$http.post('delivery/pedidos/' + this.token, this.selecionado, {emulateJSON: true})
        .then(res => {
          if (res.data && status === 2 && localStorage.getItem('impressaoAutomatica')) {
            this.imprimirSelecionado = true;
          }

          this.motivoRecusa = '';
          this.$emit('delivery_status', this.selecionado);
          this.$emit('notification');

          this.buscarPedidos();

        }, res => {
          this.loading = false;
          console.log(res);
          if (res.status === 401) {
            alert(res.data.msg);
            localStorage.removeItem('key');
            this.$router.push('/')
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
      setTimeout(() => {
        document.getElementById('text-cancelamento').focus()
      }, 500)
    }
  },

  mounted() {
    this.buscarPedidos();
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
    position: absolute; top: 28px; bottom: 8px; right: 16px; left: 0; overflow: auto; margin-top: 18px; padding: 0
  }
  .coluna-2 {
    position: absolute; top: 0; bottom: 0; right: 0; width: 60%;
  }
  .conteudo-c2 {
    position: absolute; top: 0; bottom: 16px; right: 0; left: 0;
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
</style>