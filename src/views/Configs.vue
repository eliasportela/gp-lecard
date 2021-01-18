<template>
  <div>
    <top-bar/>
    <div class="content">
      <div class="container-fluid pt-3">
        <div class="d-flex" style="height: 75vh" v-if="load">
          <div class="m-auto text-center">
            <img src="../assets/logo-lecard.png" class="animated flipInY infinite" alt="Logo Lecard" style="width: 64px;">
            <div class="small mt-3 font-weight-bold">Carregando o cardápio..</div>
          </div>
        </div>
        <div v-show="!load">
          <div class="row">
            <div class="col-md-7" v-if="adm">
              <h4 class="font-weight-bold mb-3">Dados da Empresa</h4>
              <form @submit.prevent="salvar">
                <div class="row">
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="tipo_delivery">Modo de Operação</label>
                      <select id="tipo_delivery" class="form-control" v-model="dados.tipo_delivery" required>
                        <option value="1">Entregas e retiradas</option>
                        <option value="2">Apenas retiradas</option>
                        <option value="3">Apenas entregas</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="agendamento">Pedidos Agendados</label>
                      <select id="agendamento" class="form-control" v-model="dados.entrega_agendada" required>
                        <option value="1">Ativado</option>
                        <option value="0">Desativado</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Pedido Mínimo</label>
                      <money class="form-control" v-model="dados.pedido_minimo"></money>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Entrega (minutos)</label>
                      <the-mask typeof="number" :mask="['#', '##', '###']" class="form-control" v-model="dados.media_entrega" required/>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Retirada (minutos)</label>
                      <the-mask typeof="number" :mask="['#', '##', '###']" class="form-control" v-model="dados.media_retirada" required/>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Desconto Fixo</label>
                      <the-mask typeof="number" :mask="['#' + '%', '##' + '%']" class="form-control" v-model="dados.cashback_delivery" required/>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label for="entrega_gratis">Entrega Grátis</label>
                      <select id="entrega_gratis" class="form-control" v-model="dados.entrega_gratis" required>
                        <option value="1">Sim</option>
                        <option value="0">Não</option>
                      </select>
                    </div>
                  </div>
                  <div class="col-md-4" v-show="dados.entrega_gratis === '1'">
                    <div class="form-group" title="Valor mínimo para entregas gratuitas, abaixo desse valor será cobrado o valor da entrega!">
                      <label>Mínimo<span class="small"> (Ent. Grátis)</span></label>
                      <money class="form-control" v-model="dados.entrega_gratis_minimo"></money>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="form-group">
                      <label>Valor da Entrega</label>
                      <money class="form-control" v-model="dados.valor_frete"></money>
                    </div>
                  </div>
                </div>
                <button class="btn btn-dark btn-block mt-1 mb-3">Atualizar Dados</button>
              </form>
            </div>
            <div :class="adm ? 'col-md-5' : 'col-md-6'">
              <h4 class="font-weight-bold mb-3">Impressora</h4>
              <div>
                <label for="configAutomatica">Impressão automática</label>
                <select class="form-control" id="configAutomatica" v-model="config.automatica">
                  <option value="1">Sim</option>
                  <option value="0">Não</option>
                </select>
              </div>
              <div class="mt-2">
                <label for="nCopia">Número de cópias (Automáticas)</label>
                <select class="form-control" id="nCopia" v-model="config.nCopias">
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div class="mt-2">
                <label for="zoom">Tamanho da impressão</label>
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
          <hr>
          <div class="row mb-5">
            <div class="col-md-6">
              <h4 class="font-weight-bold mb-0">Sua Conta</h4>
              <p>Para sair da sua conta use o botão abaixo</p>
              <button class="btn btn-outline-dark" @click="confirmLogout" style="width: 200px">Sair</button>
            </div>
            <div class="col-md-6">
              <div class="text-right">
                <h4 class="font-weight-bold text-danger mb-0">Danger zone</h4>
                <p>Limpar as configurações do sistema</p>
                <button class="btn btn-danger" @click="resetar" style="width: 200px">Resetar sistema</button>
              </div>
            </div>
          </div>
          <div class="mb-5" v-if="master">
            <hr>
            <h5 class="font-weight-bold mb-3">Modo Homologação</h5>
            <div class="d-inline-block pointer" @click="toggleHomologacao()">
              <span class="pr-2">{{modo_homologacao ? 'Ativado' : 'Desativado'}}</span>
              <img class="switch" src="../assets/icons/switch-on.svg" v-show="modo_homologacao">
              <img class="switch" src="../assets/icons/switch-off.svg" v-show="!modo_homologacao">
            </div>
          </div>
          <div class="small font-weight-bold mb-3">Versão: {{version}}</div>
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
        load: true,
        token: localStorage.getItem('key'),
        version: '',
        config: {
          automatica: '1',
          nCopias: '1',
          zoom: '1',
        },
        dados: {},
        modo_homologacao: false
      }
    },
    methods: {
      getDadosEmpresa() {
        this.load = true;
        this.$http.get('empresa/' + this.token).then(response => {
          this.dados = response.data;
          this.load = false;

        }, res => {
          this.load = false;
          //this.$swal(res.data.result,res.data.msg);
        });
      },

      salvar() {
        if (this.dados.entrega_gratis === '0' && this.dados.valor_frete <= 0) {
          this.$swal("", "Atenção, a entrega deve ter um valor maior que R$0.00, para entregas sem valores colocar como \"Entrega Grátis\"");
          return;
        }

        this.load = true;
        this.$http.post('empresa/' + this.token, this.dados)
          .then(res => {
            this.load = false;
            this.getDadosEmpresa();

          }, res => {
            this.load = false;
            this.$swal(res.data.result,res.data.msg);
          });
      },

      testImpressao() {
        this.load = true;
        let options = {
          content: 'Este é um teste de impressão enviado pelo Gestor de pedidos Lecard',
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

        config.set('zoom', this.config.zoom);
        localStorage.setItem('zoom', this.config.zoom);
      },

      resetar() {
        this.$swal({
          text: "Deseja resetar o sistema?",
          confirmButtonText: 'Sim',
          cancelButtonText: "Cancelar",
          showCancelButton: true,
          customClass: {
            cancelButton: 'btn btn-danger ml-3',
            confirmButton: 'btn btn-success '
          },
          buttonsStyling: false
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
          customClass: {
            cancelButton: 'btn btn-danger ml-3',
            confirmButton: 'btn btn-success '
          },
          buttonsStyling: false
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
    created() {
      // ipcRenderer.on('print-return', (event, arg) => {
      //   this.load = false;
      // });

      this.getDadosEmpresa();

      this.config.automatica = localStorage.getItem('impressaoAutomatica');
      this.config.nCopias = localStorage.getItem('nCopias');
      this.config.zoom = localStorage.getItem('zoom');
      this.version = require('electron').remote.app.getVersion();
      this.modo_homologacao = config.get('base_server');

      // ipcRenderer.send('print-list');
      // ipcRenderer.on('print-list', (event, arg) => {
      //   this.printers = arg;
      // });
    },

    computed: {
      adm() {
        return this.$store.state.dataUser.id_funcao === '1'
      },

      master() {
        return this.$store.state.dataUser.master === '1'
      }
    },
  }
</script>
