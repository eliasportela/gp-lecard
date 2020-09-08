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
          - O nosso painel administrativo está de cara nova, com vários novos relatórios e funcionalidades.
          <br>
          Para acessar, clique no Menu <b>"Portal"</b> ou digite no seu navegador: <b>portal.lecard.delivery</b>
        </p>
        <p>
          - Suporte para cadastro/alteração de produtos são realizados de segunda-feira à sexta-feira em horário comercial.
          O prazo é de até 2 dias úteis para a sua realização.
        </p>
        <p>
          Aumente a produtividade do seu delivery com o <b>LeBot</b>. <router-link to="/whatsapp">Clique aqui</router-link> para saber mais.
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
