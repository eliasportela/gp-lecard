<template>
  <div class="hello">
    <router-link to="/cardapio?desativados=true" class="card mb-3 pointer text-decoration-none text-dark" v-if="desativados">
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <h6 class="font-weight-bold mb-1">Produtos desativados</h6>
          <p class="mb-1">Você atualmente tem <b>{{desativados}}</b> produtos desativados</p>
        </div>
        <a href="#" class="text-danger font-weight-bold small">Ver produtos</a>
      </div>
    </router-link>
    <div class="img-bkg mb-3">
      <div class="img-bkg-container text-light">
        <h5 class="font-weight-bolder text-info">Precisa de ajuda?</h5>
        <p class="mb-0">Fale diretamente com nossos atendentes aqui pelo gestor</p>
      </div>
    </div>
    <p class="mb-2">
      Agora você pode falar com a nossa equipe diretamente pelo chat, disponível no botão “Ajuda” (menu a esquerda).
    </p>
    <p>
      Nosso suporte técnico funciona todos os dias da semana, das <b>09h às 21h</b>.
      Lembrando que você também pode acessar a <a href="https://lecard.tawk.help/" target="_blank" class="text-danger font-weight-bold">Central de Ajuda</a>, onde contêm as principais dicas e respostas do nosso time.
    </p>
    <div>
      <h6 class="font-weight-bolder">Alterações de Cardápio</h6>
      <p>
        Altere facilmente valores, desative ou ative produtos pelo botão "Cardápio" (menu a esquerda).
      </p>
      <p>
        Caso necessite de ajuda de nossa equipe para cadastro ou alterações de cardápio, estamos disponíveis de segunda a sexta-feira, em <b>horário comercial</b>, com um prazo de até <b>2 dias úteis</b> para a sua realização.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MsgHome',
  data() {
    return {
      desativados: null
    }
  },

  methods: {
    getDesativados() {
      this.$http.get('delivery/produtos/desativados/' + localStorage.getItem('key'))
        .then(res => {
          this.load = false;
          this.desativados = res.data ? res.data.desativados : 0;

        }, res => {
          console.log(res);
        });
    }
  },

  mounted() {
    this.getDesativados();
  }
}
</script>
<style scoped>
  .img-bkg {
    background: url("../assets/callcenter.png") no-repeat center;
    background-size: cover;
    position: relative;
    height: 180px;
    border-radius: 8px;
    overflow: hidden;
  }
  .img-bkg-container {
    background-color: rgba(0,0,0,0.8);
    border-radius: 8px;
    padding: 24px;
    width: 90%;
    margin: 36px auto;
  }
</style>
