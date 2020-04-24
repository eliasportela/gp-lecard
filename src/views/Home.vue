<template>
  <div>
    <top-bar/>
    <div class="content">
      <div class="text-center p-5">
        <img src="../assets/logo-lecard.png" alt="" style="width: 100px">
        <h4 class="text-danger font-weight-bold mt-4">Bem vindo ao Gestor de Pedidos - Lecard</h4>
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
  mounted() {
    // console.log(myNotification);
    // myNotification.show();
  }
}
</script>
