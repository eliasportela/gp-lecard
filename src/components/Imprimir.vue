<template>
  <div>
    <div id="containerPedido" class="hide" v-if="pedido.pedido">
      <div class="center bold large">{{pedido.nome_empresa}}</div>
      <div class="center bold">{{ pedido.pedido }} | {{pedido.data_pedido}} | {{ pedido.tipo }}</div>
      <div class="center bold">{{pedido.obs_pedido}}</div>
      <div v-if="pedido.cliente" class="bold" style="margin-top: 12px;">
        {{pedido.cliente.nome_cliente}}
        <div>
          {{pedido.cliente.endereco}}, {{pedido.cliente.numero}}, {{pedido.cliente.bairro}} - {{pedido.cliente.nome_cidade}}
        </div>
        <div>CEP: {{pedido.cliente.cep}} <span v-show="pedido.cliente.complemento">-</span> {{pedido.cliente.complemento}}</div>
        <div><b>Telefone:</b> {{pedido.cliente.telefone | phone}} </div>
      </div>
      <hr>
      <table>
        <tr>
          <th style="width: 20px; text-align: left">QTD</th>
          <th style="text-align: left">PRODUTO</th>
          <th style="width: 60px; text-align: right">VALOR</th>
        </tr>
        <tr v-for="i in pedido.itens">
          <td>{{i.quantidade}}x</td>
          <td>
            <div class="bold">{{i.nome_produto}} {{i.nome_tabela}}</div>
            <div v-for="d in i.divisao">
              # {{d.nome_produto}}
            </div>
            <div v-for="a in i.adicionais">
              + {{a.quantidade}}x {{a.nome_produto}} <b v-show="a.valor_total > 0">R$ {{a.valor_total}}</b>
            </div>
            <div class="bold" v-show="i.observacao">Obs: {{i.observacao}}</div>
          </td>
          <td style="text-align: right">{{(i.valor_total) | valor}}</td>
        </tr>
      </table>
      <div class="bold" v-show="pedido.total && pedido.total > 0" style="margin-top: 16px">
        <span style="float: right">R$ {{pedido.total}}</span>
        Total:
      </div>
      <div class="center" style="margin-top: 32px; font-size: 12px">
        <div class="bold">LeCard - storkdigital.com.br</div>
        Uma comanda digital para o seu negócio real
      </div>
    </div>

    <div id="containerCupom" class="hide" v-if="venda.id_comanda">
      <div class="center bold large">{{venda.empresa.nome_fantasia}}</div>
      <div class="center" style="font-size: 12px">
        <div>{{venda.empresa.endereco}}, {{venda.empresa.numero}}</div>
        <div>{{venda.empresa.cnpj}}</div>
      </div>
      <hr>
      <div class="center bold">{{ venda.id_comanda }} | {{venda.data_comanda}} - {{venda.hora_comanda}}</div>
      <div class="center bold" v-show="venda.observacao">{{venda.observacao}}</div>
      <hr>
      <div class="bold center">CUPOM NÃO FISCAL</div>
      <hr>
      <table>
        <tr>
          <th style="width: 20px; text-align: left">QTD</th>
          <th style="text-align: left">PRODUTO</th>
          <th style="width: 60px; text-align: right">VALOR</th>
        </tr>
        <tr v-for="i in venda.itens">
          <td>{{i.quantidade | qtd}}x</td>
          <td>
            <div class="bold">{{i.produto.nome_produto}} <span v-show="i.produto.principal === '0'">{{i.produto.nome_tabela}}</span></div>
            <div v-for="d in i.divisao">
              # {{d.nome_produto}}
            </div>
            <div v-for="a in i.adicionais">
              + {{a.quantidade | qtd}}x {{a.nome_produto}} <b v-show="a.valor_total > 0">R$ {{a.valor_total}}</b>
            </div>
            <div class="bold" v-show="i.observacao">Obs: {{i.observacao}}</div>
          </td>
          <td style="text-align: right">{{(i.produto.valor_total) | valor}}</td>
        </tr>
      </table>
      <hr>
      <div>
        <b>Pagamentos</b>
        <div v-for="p in venda.pagamentos">
          <span style="float: right">R$ {{p.valor}}</span>
          {{p.nome_pagamento}}
        </div>
        <div>
          <span style="float: right">R$ {{venda.troco}}</span>
          Troco
        </div>
        <hr>
        <b>TOTAIS</b>
        <div>
          <span style="float: right">R$ {{(venda.total - venda.desconto) | valor}}</span>
          SUB-TOTAL
        </div>
        <div>
          <span style="float: right">R$ {{venda.desconto}}</span>
          DESCONTO
        </div>
        <div>
          <span style="float: right"><b>R$ {{venda.total}}</b></span>
          <b>TOTAL</b>
        </div>
      </div>
      <div class="center" style="margin-top: 32px; font-size: 12px">
        <div class="bold">LeCard - storkdigital.com.br</div>
        Uma comanda digital para o seu negócio real
      </div>
    </div>
  </div>
</template>

<script>
  const { ipcRenderer } = require('electron');

  export default {
    name: "Imprimir",
    data() {
      return {
        pedido: '',
        venda: ''
      }
    },

    methods: {
      print(container) {
        const cId = document.getElementById(container)
        if (cId) {
          let options = {
            content: document.getElementById(container).innerHTML,
            copies: 1
          };
          ipcRenderer.send('printVenda', options);
        }
      }
    },

    created() {
      this.$parent.$on('print-venda', (data) => {

        this.venda = '';
        this.pedido = '';

        if (data.layout === 'cupom') {
          this.venda = data;
          this.$nextTick(function () {
            this.print('containerCupom');
          });

        } else {
          this.pedido = data;
          this.$nextTick(function () {
            this.print('containerPedido');
          });
        }
      });
    },

    filters: {
      qtd(value) {
        if (value !== null || value !== undefined) {
          return parseFloat(value).toFixed();
        }
      },

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
  .hide {
    display: none;
  }
</style>
