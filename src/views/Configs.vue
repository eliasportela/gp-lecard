<template>
  <div>
    <top-bar/>
    <div class="content">
      <div class="container-fluid pt-3">
        <div>
          <div class="row justify-content-end">
            <div class="col-md-5">
              <h4 class="font-weight-bold mb-3">Impressora</h4>
              <div class="card">
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6 mb-2">
                      <label class="mb-0" for="impressoraPedidos">Pedidos</label>
                      <select class="form-control" id="impressoraPedidos" v-model="config.device">
                        <option value="">Impressora Default</option>
                        <option :value="p.name" v-for="p in printers">{{p.name}}</option>
                      </select>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="mb-0" for="impressoraComanda">Comanda</label>
                      <select class="form-control" id="impressoraComanda" v-model="config.devicePdv">
                        <option value="">Impressora Default</option>
                        <option :value="p.name" v-for="p in printers">{{p.name}}</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="mb-0" for="configAutomatica">Impressão automática</label>
                    <select class="form-control" id="configAutomatica" v-model="config.automatica">
                      <option value="1">Sim</option>
                      <option value="0">Não</option>
                    </select>
                  </div>
                  <div class="mt-2" v-if="config.automatica === '1'">
                    <label class="mb-0" for="nCopia">Número de cópias (Automáticas)</label>
                    <select class="form-control" id="nCopia" v-model="config.nCopias">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                  <div class="mt-2">
                    <label class="mb-0" for="zoom">Tamanho da impressão</label>
                    <select class="form-control" id="zoom" v-model="config.zoom">
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                  <div class="mt-4 mb-4">
                    <button class="btn btn-dark btn-block mb-3" @click="atualizarConfig">{{atualizar ? 'Salvo' : 'Salvar Configurações'}}</button>
                    <button class="btn btn-outline-dark btn-block" @click="testImpressao">Enviar teste impressão</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-7">
              <h4 class="font-weight-bold mb-3">Sistema</h4>
              <div class="row">
                <div class="col-md-12 col-xl-6">
                  <div class="card mb-3">
                    <div class="card-body">
                      <h6 class="mb-0">{{user.nome_fantasia}}</h6>
                      <p class="m-0"><span>{{user.email}}</span></p>
                      <button class="btn btn-outline-dark mt-3" @click="confirmLogout" style="width: 200px">Sair</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-12 col-xl-6">
                  <div class="card mb-3">
                    <div class="card-body">
                      <h6 class="text-danger mb-0">Danger zone</h6>
                      <p>Limpar as configurações do sistema</p>
                      <button class="btn btn-danger" @click="resetar" style="width: 200px">Resetar sistema</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card" v-if="master">
                <div class="card-body">
                  <h6 class="mb-0">Modo Homologação</h6>
                  <p>Alterar para o servidor de homologação</p>
                  <div class="d-inline-block pointer" @click="toggleHomologacao()">
                    <span class="pr-2">{{modo_homologacao ? 'Ativado' : 'Desativado'}}</span>
                    <img class="switch" src="../assets/icons/switch-on.svg" v-show="modo_homologacao">
                    <img class="switch" src="../assets/icons/switch-off.svg" v-show="!modo_homologacao">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <hr>
          <div class="small font-weight-bold mb-3 text-right">Gestor de Pedidos - LeCard Delivery - Versão: {{version}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const {ipcRenderer} = require('electron');
  const Config = require('electron-config');
  const config = new Config();

  import TopBar from '@/components/TopBar.vue'
  import {Money} from 'v-money'

  export default {
    name: 'Home',
    components: {
      TopBar, Money
    },
    data() {
      return {
        atualizar: false,
        token: localStorage.getItem('key'),
        version: '',
        config: {
          device: '',
          devicePdv: '',
          automatica: '1',
          nCopias: '1',
          zoom: '1',
        },
        modo_homologacao: false,
        printers: []
      }
    },
    methods: {
      testImpressao() {
        let options = {
          content: 'Este é um teste de impressão enviado pelo Gestor de pedidos Lecard',
          copies: 1,
          zoom: this.config.zoom,
          device: this.config.device,
        };
        ipcRenderer.send("print", options);
      },

      atualizarConfig() {
        this.atualizar = true;

        config.set('device', this.config.device);
        localStorage.setItem('device', this.config.device);

        config.set('devicePdv', this.config.devicePdv);
        localStorage.setItem('devicePdv', this.config.devicePdv);

        config.set('impressaoAutomatica', this.config.automatica);
        localStorage.setItem('impressaoAutomatica', this.config.automatica);

        config.set('nCopias', this.config.nCopias);
        localStorage.setItem('nCopias', this.config.nCopias);

        config.set('zoom', this.config.zoom);
        localStorage.setItem('zoom', this.config.zoom);
      },

      resetar() {
        this.$swal({
          text: "Deseja resetar o sistema?",
          confirmButtonText: 'Sim',
          cancelButtonText: "Cancelar",
          showCancelButton: true,
        }).then((result) => {
          if (result.value) {
            config.clear();
            localStorage.clear();
            this.$router.push('/');
            ipcRenderer.send('reload');
          }
        });

      },

      logout() {
        config.delete('key');
        config.delete('token');
        config.delete('empresas');
        localStorage.clear();
      },

      confirmLogout() {
        this.$swal({
          text: "Deseja sair do sistema?",
          confirmButtonText: 'Sim',
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          dangerMode: true
        }).then((result) => {
          if (result.value) {
            this.logout();
            this.$router.push("/");
          }
        });
      },

      toggleHomologacao() {
        this.logout();

        this.modo_homologacao = !this.modo_homologacao;
        if (this.modo_homologacao) {
          config.set('base_server','https://api.storkdigital.com.br/dev/');

        } else {
          config.delete('base_server');
        }

        this.$router.push("/");
        ipcRenderer.send('reload');
      }
    },

    mounted() {
      ipcRenderer.send('getPrinters');
    },

    created() {
      this.config.automatica = localStorage.getItem('impressaoAutomatica');
      this.config.nCopias = localStorage.getItem('nCopias');
      this.config.zoom = localStorage.getItem('zoom');
      this.version = require('electron').remote.app.getVersion();
      this.modo_homologacao = config.get('base_server');

      if (localStorage.getItem('device')) {
        this.config.device = localStorage.getItem('device');
      }

      if (localStorage.getItem('devicePdv')) {
        this.config.devicePdv = localStorage.getItem('devicePdv');
      }

      ipcRenderer.on('getPrinters', (event, arg) => {
        // console.log(arg)
        this.printers = arg;
      });
    },

    computed: {
      adm() {
        return this.$store.state.dataUser.id_funcao === '1'
      },

      user() {
        return this.$store.state.dataUser
      },

      master() {
        return this.$store.state.dataUser.master === '1'
      }
    },
  }
</script>
