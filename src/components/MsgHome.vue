<template>
  <div class="hello">
    <div class="img-bkg mb-3">
      <div class="img-bkg-container text-light">
        <h5 class="font-weight-bolder text-danger">Programa de Vantagens</h5>
        <p class="mb-0">Fidelize seus clientes com benefícios e vantagens. <br> Quanto mais ele compra, mais ele ganha!</p>
      </div>
    </div>
    <div class="mb-4">
      <p>
        Agora seus clientes podem acumular pontos ao realizar pedidos e trocar por recompensas definidas por você.
        Os benefícios poderão ser produtos, brindes (regatados na própria loja por meio de vouchers) ou cupons de descontos a serem usados no próprio aplicativo.
      </p>
      <p>Converse com a nossa equipe para saber mais.</p>
    </div>
    <div class="mb-4">
      <h6 class="text-danger font-weight-bolder">QR Code nas mesas</h6>
      <p>
        Com o LeCard No Local seus clientes poderão visualizar seu cardápio digital e fazer seu pedido diretamente na mesa ou balcão.
      </p>
    </div>
    <h4 class="mb-4">Ajuda e suporte</h4>
    <div>
      <h6 class="text-danger font-weight-bolder">Prazos para suporte</h6>
      <p>
        Suporte para cadastro/alteração de produtos são realizados de segunda-feira à sexta-feira em horário comercial.
        O prazo é de 2 dias úteis para a sua realização.
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MsgHome',
}
</script>
<style scoped>
  .img-bkg {
    background: url("https://lecard-cdn.nyc3.digitaloceanspaces.com/lecard-corporativo/static/imgs/bkg-happy.jpg") no-repeat;
    background-size: cover;
    position: relative;
    height: 200px;
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
