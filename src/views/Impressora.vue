<template>
  <div>
    <top-bar/>
    <div class="content">
      <div class="container-fluid">
        <div class="row">
          <div class="col-4">
            <h4 class="font-weight-bold mt-4">Configurações</h4>
            <div class="mt-4">
              <label for="configAutomatica">Impressão automática</label>
              <select class="form-control" id="configAutomatica" v-model="config.automatica">
                <option :value="1">Sim</option>
                <option :value="2">Não</option>
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
              <button class="btn btn-danger btn-block" @click="atualizarConfig">{{atualizar ? 'Salvo' : 'Salvar'}}</button>
            </div>
          </div>
          <div class="col-8">
            <h4 class="font-weight-bold mt-4">Teste de impressora</h4>
            <div class="mt-4">
              <label for="testImpressao">Enviar teste de impressão</label>
              <textarea id="testImpressao" v-model="msgImpressao" class="form-control" style="height: 320px; overflow: auto">
              </textarea>
              <button class="btn btn-dark btn-block mt-3" @click="testImpressao" :disabled="load">{{load ? 'Enviando teste' : 'Enviar Teste'}}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require('electron');
const Config = require('electron-config');

import TopBar from '@/components/TopBar.vue'
import HelloWorld from '@/components/HelloWorld.vue'

const config = new Config();

export default {
  name: 'Home',
  components: {
    HelloWorld, TopBar
  },
  data() {
    return {
      atualizar: false,
      load: false,
      config: {
        automatica: 1,
        nCopias: 1,
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

      if (this.config.automatica === 1) {
        localStorage.setItem('impressaoAutomatica', '1');
        config.set('impressaoAutomatica', '1');

      } else {
        localStorage.removeItem('impressaoAutomatica');
        config.delete('impressaoAutomatica');
      }

      config.set('nCopias', this.config.nCopias);
      localStorage.setItem('nCopias', this.config.nCopias);
    }
  },
  created() {
    ipcRenderer.on('print-return', (event, arg) => {
      // console.log(arg);
      this.load = false;
    });

    this.config.automatica = localStorage.getItem('impressaoAutomatica') ? 1 : 2;
    this.config.nCopias = config.get('nCopias') ? config.get('nCopias') : 1;

    // ipcRenderer.send('print-list');
    // ipcRenderer.on('print-list', (event, arg) => {
    //   this.printers = arg;
    // });
  },
}
</script>
