<template>
  <div id="modal" class="modal" v-show="opened">
    <div class="modal-content animated bounceInDown">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: "ModalBottom",
    props: ['opened'],
    methods: {
      getDominio() {
        return empresa.dominio
      }
    }
  }
</script>

<style scoped>
  .modal {
    display: block; /* Hidden by default */
    position: fixed; /* Stay in place */
    z-index: 999; /* Sit on top */
    left: 0;
    top: 0;
    width: 100%; /* Full width */
    height: 100%; /* Full height */
    overflow: auto; /* Enable scroll if needed */
    background-color: rgb(0,0,0); /* Fallback color */
    background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
  }

  /* Modal Content/Box */
  .modal-content {
    background-color: #fefefe;
    margin: 10% auto 0;
    padding: 20px 10px;
    border: 1px solid #888;
    border-radius: 2px;
    max-width: 450px;
  }

  @media (max-width: 600px) {
    .modal-content {
      margin: 15% auto;
      width: 95%; /* Could be more or less, depending on screen size */
    }
  }
</style>
