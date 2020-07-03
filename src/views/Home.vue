<template>
  <div>
    <top-bar @delivery_desativado="deliveryDesativado"/>
    <div class="content">
      <div class="text-center p-5">
        <img src="../assets/logo-lecard.png" alt="" style="width: 100px">
        <h4 class="text-danger font-weight-bold mt-4">Bem-vindo ao Gestor de Pedidos - Lecard</h4>
        <p>Esperemos que aproveite todas as novidades que fizemos para facilitar mais ainda o seu negócio.</p>
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue'
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'Home',
  components: {
    HelloWorld, TopBar
  },

  methods: {
    deliveryDesativado() {
      // this.$swal('', 'Seu delivery está desativado. Ative-o para receber seus pedidos!');
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
  },

  mounted() {
    // console.log(myNotification);
    // myNotification.show();
  }
}
</script>
