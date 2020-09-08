<template>
  <div>
    <top-bar @delivery_desativado="deliveryDesativado"/>
    <div class="content">
      <div class="p-5">
        <div class="text-center">
          <img src="../assets/logo-lecard.png" alt="Logo Lecard" style="width: 70px">
          <h4 class="text-danger font-weight-bold mt-3">Avisos e Novidades</h4>
        </div>
        <p class="mt-4">
          - O nosso painel administrativo agora será chamado de <b>Portal LeCard.</b>
          <br>
          Para acessar, clique no Menu <b>"Portal"</b> ou digite no seu navegador: <b>portal.lecard.delivery</b>
        </p>
        <p>
          - Para melhor atende-los, havendo a necessidade do serviço de cadastro/alteração de produtos, o mesmo será realizado de segunda-feira à sexta-feira em horário comercial.
          Pedimos também um prazo de até 24 horas para a sua realização.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue'

export default {
  name: 'Home',
  components: {
    TopBar
  },

  methods: {
    deliveryDesativado() {
      this.$swal.fire({
        title: 'O delivery está desativado!',
        text: "Ative-o para receber seus pedidos.",
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        cancelButtonText: 'Voltar',
        confirmButtonText: 'Sim, ativar delivery!'
      }).then((result) => {
        if (result.value) {
          this.$emit('ativarDelivery');
          this.$swal('', 'Delivery ativado!')
        }
      })
    }
  }
}
</script>
