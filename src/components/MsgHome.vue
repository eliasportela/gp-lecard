<template>
  <div class="hello">
    <div class="img-bkg mb-3">
      <div class="img-bkg-container text-light">
        <h5 class="font-weight-bolder text-info">Pagamento via PIX</h5>
        <p class="mb-0">Receba o valor dos seus pedidos instantaneamente e sem custo adicional</p>
      </div>
    </div>
    <div class="mb-4">
      <p>
        O LeCard agora aceita Pix como forma de pagamento. O Fluxo é simples: ao finalizar o pedido, seu cliente escolhe a forma de pagamento PIX,
        copia a chave, faz o pagamento e confirma. Depois disso o pedido chega aqui no seu gestor.
      </p>
      <p>Lembre-se, você é o responsável por conferir se houve o pagamento, e se o valor enviado está correto.</p>
    </div>
    <div class="mb-4">
      <h6 class="text-danger font-weight-bolder">Programa de Vantagens</h6>
      <p>
        Seus clientes acumulam pontos ao realizar pedidos e trocam por recompensas definidas por você.
        Os benefícios poderão ser produtos, brindes (regatados na própria loja por meio de vouchers) ou cupons de descontos a serem usados no aplicativo.
      </p>
      <p>Converse com a nossa equipe para saber mais.</p>
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
    background: url("https://lecard-cdn.nyc3.digitaloceanspaces.com/lecard-gestor/pagamento-pix.jpg") no-repeat center;
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
