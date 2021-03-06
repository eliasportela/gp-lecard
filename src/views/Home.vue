<template>
  <div>
    <top-bar/>
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
  }
}
</script>
