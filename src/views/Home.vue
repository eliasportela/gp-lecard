<template>
  <div>
    <top-bar @delivery_desativado="deliveryDesativado"/>
    <div class="content">
      <div class="p-5">
        <msg-home/>
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue'
import MsgHome from "../components/MsgHome";

export default {
  name: 'Home',
  components: {
    MsgHome,
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
