<template>
  <div>
    <top-bar/>
    <div style="height: 100vh; margin-left: 70px; position: relative;">
      <container-pedidos/>
    </div>
  </div>
</template>

<script>
  import TopBar from "../components/TopBar";
  import ContainerPedidos from "../components/ContainerPedidos";

  export default {
    name: 'Pedidos',
    components: {ContainerPedidos, TopBar},
  }
</script>
