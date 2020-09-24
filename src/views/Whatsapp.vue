<template>
  <div>
    <top-bar/>
    <div class="content">
      <div class="p-5">
        <div class="text-center">
          <img src="../assets/logo-zap.png" alt="Logo Lecard" style="width: 70px; border-radius: 8px">
          <h4 class="font-weight-bold mt-3">LeCard + WhatsApp</h4>
        </div>
        <p class="mt-4">
          Aumente sua produtividade direcionando os pedidos do WhatsApp para o seu delivery. Funciona assim:
        </p>
        <p class="my-1">
          <b>1 - </b> Clique no botão abaixo para abrir/ativar o <b>LeBot</b>.
        </p>
        <p class="my-1">
          <b>2 - </b> Acesse, lendo o QR Code, assim como é feito para acessar o WhatsApp Web. Agora, suas conversas serão respondidas automaticamente por nosso atendente virtual <span class="font-weight-bold">LeBot</span>.
        </p>
        <p class="my-1">
          <b>3 - </b>
          Se precisar pausar as respostas automáticas, basta acessar o menu
          <b>"Opções"</b> e clicar em: <b>"Pausar LeBot"</b>, ou fechar a jenela.
        </p>
        <p class="text-center mt-4">
          <button class="btn btn-outline-success mr-3" @click="desativarWpp" style="width: 250px" v-if="whatsappBot">
            Desativar o LeBot
          </button>
          <button class="btn btn-success" @click="openWpp" style="width: 250px">
            {{whatsappBot ? 'Abrir' : 'Ativar'}} o LeBot
          </button>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
  import TopBar from "../components/TopBar";
  const { ipcRenderer } = require('electron');
  const Config = require('electron-config');
  const config = new Config();

  export default {
    name: "Whatsapp",
    components: {TopBar},
    data() {
      return {
        whatsappBot: false
      }
    },
    methods: {
      openWpp() {
        config.set('whatsappBot', 'true');
        const dados = this.$store.state.dataUser
        ipcRenderer.send('openWpp', {
          ...dados
        });

        this.whatsappBot = !this.whatsappBot
      },

      desativarWpp() {
        config.delete('whatsappBot');
        this.whatsappBot = !this.whatsappBot
      }
    },
    mounted() {
      this.whatsappBot = !!config.get('whatsappBot');
    }
  }
</script>

<style scoped>

</style>
