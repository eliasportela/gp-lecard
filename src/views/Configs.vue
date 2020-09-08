<template>
  <div>
    <top-bar/>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-md-5">
            <h4 class="font-weight-bold mt-4">Impressora</h4>
            <div class="mt-4">
              <label for="configAutomatica">Impressão automática</label>
              <select class="form-control" id="configAutomatica" v-model="config.automatica">
                <option value="1">Sim</option>
                <option value="0">Não</option>
              </select>
            </div>
            <div class="mt-4">
              <label for="nCopia">Número de cópias (Automáticas)</label>
              <select class="form-control" id="nCopia" v-model="config.nCopias">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div class="mt-4 mt-3">
              <button class="btn btn-dark btn-block" @click="atualizarConfig">{{atualizar ? 'Salvo' : 'Salvar'}}</button>
            </div>
          </div>
          <div class="col-md-7 mb-4">
            <h4 class="font-weight-bold mt-4">Teste de impressão</h4>
            <div class="mt-4">
              <label for="testImpressao">Enviar teste de impressão</label>
              <textarea id="testImpressao" v-model="msgImpressao" class="form-control"
                        style="height: 140px; overflow: auto">
              </textarea>
              <button class="btn btn-dark btn-block mt-3" @click="testImpressao" :disabled="load">{{load ? 'Enviando teste' : 'Enviar Teste'}}</button>
            </div>
          </div>
        </div>
        <div class="col-md-12 border-top">
          <h4 class="font-weight-bold my-4 text-danger">Danger zone</h4>
          <div>
            <button class="btn btn-danger" @click="resetar" style="width: 300px">Resetar sistema</button>
          </div>
        </div>
      </div>
      <div class="position-fixed" style="right: 14px; bottom: 12px;">
        <span class="small font-weight-bold">Versão: {{version}}</span>
      </div>
    </div>
  </div>
</template>

<script>
  const {ipcRenderer} = require('electron');
  const Config = require('electron-config');
  const config = new Config();

  import TopBar from '@/components/TopBar.vue'

  export default {
    name: 'Home',
    components: {
      TopBar
    },
    data() {
      return {
        atualizar: false,
        load: false,
        version: '',
        config: {
          automatica: '1',
          nCopias: '1',
        },
        msgImpressao: 'Este é um teste de impressão enviado pelo Gestor de pedidos Lecard',
      }
    },
    methods: {
      testImpressao() {
        this.load = true;
        let options = {
          content: this.msgImpressao,
          copies: 1
        };
        ipcRenderer.send("print", options);
      },

      atualizarConfig() {
        this.atualizar = true;

        config.set('impressaoAutomatica', this.config.automatica);
        localStorage.setItem('impressaoAutomatica', this.config.automatica);

        config.set('nCopias', this.config.nCopias);
        localStorage.setItem('nCopias', this.config.nCopias);
      },

      resetar() {
        config.clear();
        localStorage.clear();
        this.$router.push('/');
        ipcRenderer.send('reloud');
      }
    },
    created() {
      ipcRenderer.on('print-return', (event, arg) => {
        this.load = false;
      });

      this.config.automatica = localStorage.getItem('impressaoAutomatica');
      this.config.nCopias = localStorage.getItem('nCopias');
      this.version = require('electron').remote.app.getVersion();

      // ipcRenderer.send('print-list');
      // ipcRenderer.on('print-list', (event, arg) => {
      //   this.printers = arg;
      // });
    },
  }
</script>
