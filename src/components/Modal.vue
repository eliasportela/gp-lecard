<template>
  <div class="modal" :class="width" v-show="opened">
    <div class="modal-content" :class="width === 'small' ? 'animated zoomIn' : ''">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Modal",
    props: ['opened', 'width'],

    created() {
      this.$parent.$on('openModal', (dados) => {
        this.$emit('loadDadosModal', dados)
      });
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
    border-radius: 4px;
    max-width: 450px;
  }

  .modal.full .modal-content {
    max-width: none;
    width: calc(100% - 85px);
    margin: 65px auto 0 77px;
    height: calc(100% - 75px);
    position: relative;
    padding: 0;
  }

  .modal.small .modal-content {
    background-color: #fefefe;
    margin: 10% auto 0;
    padding: 20px 10px;
    border-radius: 4px;
    max-width: 450px;
    height: auto;
  }

  @media (max-width: 600px) {
    .modal-content {
      margin: 15% auto;
      width: 95%; /* Could be more or less, depending on screen size */
    }
  }
</style>
