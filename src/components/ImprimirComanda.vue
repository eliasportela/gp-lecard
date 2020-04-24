<template>
  <div v-if="venda" id="containerVenda" class="hide">
    <div class="center bold large">{{venda.nome_empresa}}</div>
    <div class="center bold">{{venda.data_pedido}}</div>
    <div class="center bold large">{{ venda.tipo }} | {{ venda.pedido }}</div>
    <div class="center bold large">{{venda.obs_comanda}}</div>
    <div class="center bold large">{{venda.cliente}}</div>
    <div class="center bold">--------------------------------------------------</div>
    <div v-for="i in venda.itens">
      <div class="large bold"> {{i.quantidade}} x {{i.nome_produto}} {{i.nome_tabela}}</div>
      <div class="large bold"> {{i.divisoes}}</div>
      <div class="large bold" v-show="i.adicionais">#C/ {{i.adicionais}}</div>
      <div class="large bold" v-show="i.observacao">#Obs: {{i.observacao}}</div>
      <div class="center bold">--------------------------------------------------</div>
    </div>
    <div class="large bold" v-show="venda.total > 0"> #Total: R$ {{venda.total}}</div>
  </div>
</template>

<script>
  const { ipcRenderer } = require('electron');

  export default {
    name: "ImprimirComanda",
    data() {
      return {
        venda: ''
      }
    },
    methods: {
      print() {
        let options = {
          content: document.getElementById('containerVenda').innerHTML,
          copies: 1
        };
        setTimeout(() => {
          ipcRenderer.send('printVenda', options);
        }, 1000);
      }
    },
    created() {
      this.$parent.$on('print-venda', (data) => {
        this.venda = data;
        this.print();
      });
    }
  }
</script>

<style scoped>
  .hide {
    display: none;
  }
</style>