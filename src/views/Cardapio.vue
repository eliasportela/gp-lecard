<template>
  <div>
    <top-bar/>
    <div class="content" style="padding-top: 10px">
      <div class="container-fluid">
        <div class="d-flex" style="height: 75vh" v-if="loading">
          <div class="m-auto text-center">
            <img src="../assets/logo-lecard.png" class="animated flipInY infinite" alt="Logo Lecard" style="width: 64px;">
            <div class="small mt-3 font-weight-bold">Carregando o cardápio..</div>
          </div>
        </div>
        <div id="categorias" style="margin-bottom: 32px" v-show="!loading">
          <div class="row mb-4">
            <div :class="empresas.length > 1 ? 'col-8 col-xl-9' : 'col-12'">
              <label for="search" class="mb-0 small">Pesquisar produto</label>
              <input id="search" type="search" class="form-control small" placeholder="Pesquisar" v-model="term" @keyup="pesquisar" @search="pesquisar">
            </div>
            <div class="col-4 col-xl-3" v-if="empresas.length > 1">
              <label for="empresa" class="mb-0 small">Empresa</label>
              <select id="empresa" class="form-control" @change="acessarEmpresa()" v-model="token">
                <option :value="e.key" v-for="e in empresas">{{e.nome_fantasia}}</option>
              </select>
            </div>
          </div>
          <div v-if="categorias.length">
            <div v-if="!searchResult.length && !term.length">
              <div class="mb-3" v-for="c in categorias" v-if="c.delivery === '1'">
                <!--categorias-->
                <div class="border pointer bg-light rounded-sm" @click="toogleCategoria(c)">
                  <div class="row">
                    <div class="col-9 align-self-center">
                      <div class="p-4">
                        <div v-if="c.id_cardapio !== '1'">
                          <span class="badge badge-danger">{{c.id_cardapio | cardapio}}</span>
                        </div>
                        {{c.nome_categoria}}
                      </div>
                    </div>
                    <div class="col-3 align-self-center text-right">
                      <div class="p-4 small">
                        Expandir <img src="../assets/icons/arrow-right.svg" style="width: 10px">
                      </div>
                    </div>
                  </div>
                </div>
                <!--produtos-->
                <div v-show="selCategoria.includes(c.id_categoria)">
                  <h6 class="pl-3 my-4">Produtos</h6>
                  <div v-for="p in c.produtos">
                    <div class="border-top">
                      <div class="row">
                        <div class="col-8 align-self-center pointer" @click="toogleProduto(p)">
                          <div class="p-3">
                            {{p.nome_produto}}
                          </div>
                        </div>
                        <div class="col-4 text-right align-self-center">
                          <div class="p-3">
                            <div class="d-inline-block pointer" @click="editarProduto(p)" :class="{'visibility': c.delivery === '0'}">
                              <span class="pr-2" :class="p.fg_ativo === '1' ? 'text-success' : 'text-secondary'">{{p.fg_ativo === '1' ? 'Ativado' : 'Desativado'}}</span>
                              <img class="switch" src="../assets/icons/switch-on.svg" v-show="p.fg_ativo === '1'">
                              <img class="switch" src="../assets/icons/switch-off.svg" v-show="p.fg_ativo === '2'">
                            </div>
                            <div class="d-inline-block ml-3 px-3 pointer" @click="toogleProduto(p)">
                              <img src="../assets/icons/arrow-right.svg" style="width: 10px">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <!--tabelas-->
                    <div class="mb-4" v-show="selProduto.includes(p.id_produto)">
                      <table class="table border">
                        <thead class="bg-light">
                        <tr>
                          <th>Tabela</th>
                          <th class="text-center" style="width: 250px">{{p.delivery === '1' ? 'Valor' : ''}} &nbsp;</th>
                          <th style="width: 150px">&nbsp;</th>
                        </tr>
                        </thead>
                        <tr v-for="t in p.tabelas">
                          <td class="align-middle">
                            {{t.nome_tabela}}
                          </td>
                          <td class="align-middle">
                            <div class="input-group mb-2" v-if="p.delivery === '1'">
                              <money class="form-control" v-model="t.valor" :disabled="!adm"/>
                              <div class="input-group-append" style="width: 100px" v-if="adm">
                                <button :id="'btn' + t.id_tabela_preco" class="btn btn-dark btn-edit" @click="editarValor(t, 'btn')">Salvar</button>
                              </div>
                            </div>
                          </td>
                          <td class="align-middle">
                            <div class="p-2 pointer" @click="editarTabela(t, p)" :class="{'visibility': p.fg_ativo === '2' || c.delivery === '0'}">
                              <span class="pr-2" :class="t.fg_ativo === '1' ? 'text-success' : 'text-secondary'">{{t.fg_ativo === '1' ? 'Ativado' : 'Desativado'}}</span>
                              <img class="switch" src="../assets/icons/switch-on.svg" v-show="t.fg_ativo === '1'">
                              <img class="switch" src="../assets/icons/switch-off.svg" v-show="t.fg_ativo === '2'">
                            </div>
                          </td>
                        </tr>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mb-3" v-if="searchResult.length">
              <div v-for="p in searchResult">
                <div class="border-top">
                  <div class="row">
                    <div class="col-8 align-self-center pointer" @click="toogleProduto(p)">
                      <div class="py-3 px-2">
                        <div>{{p.nome_produto}}</div>
                        <span class="badge badge-dark small mt-0">{{p.nome_categoria}}</span>
                      </div>
                    </div>
                    <div class="col-4 text-right align-self-center">
                      <div class="p-3">
                        <div class="d-inline-block pointer" @click="editarProduto(p)">
                          <span class="pr-2" :class="p.fg_ativo === '1' ? 'text-success' : 'text-secondary'">{{p.fg_ativo === '1' ? 'Ativado' : 'Desativado'}}</span>
                          <img class="switch" src="../assets/icons/switch-on.svg" v-show="p.fg_ativo === '1'">
                          <img class="switch" src="../assets/icons/switch-off.svg" v-show="p.fg_ativo === '2'">
                        </div>
                        <div class="d-inline-block ml-3 px-3 pointer" @click="toogleProduto(p)">
                          <img src="../assets/icons/arrow-right.svg" style="width: 10px">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!--tabelas-->
                <div class="mb-4" v-show="selProduto.includes(p.id_produto)">
                  <table class="table border">
                    <thead class="bg-light">
                    <tr>
                      <th>Tabela</th>
                      <th class="text-center" style="width: 250px">{{p.delivery === '1' ? 'Valor' : ''}} &nbsp;</th>
                      <th style="width: 150px">&nbsp;</th>
                    </tr>
                    </thead>
                    <tr v-for="t in p.tabelas">
                      <td class="align-middle">
                        {{t.nome_tabela}}
                      </td>
                      <td class="align-middle">
                        <div class="input-group mb-2" v-if="p.delivery === '1'">
                          <money class="form-control" v-model="t.valor" :disabled="!adm"/>
                          <div class="input-group-append" style="width: 100px" v-if="adm">
                            <button :id="'btn' + t.id_tabela_preco" class="btn btn-dark btn-edit" @click="editarValor(t, 'btn')">Salvar</button>
                          </div>
                        </div>
                      </td>
                      <td class="align-middle">
                        <div class="p-2 pointer" @click="editarTabela(t, p)" :class="{'visibility': p.fg_ativo === '2'}">
                          <span class="pr-2" :class="t.fg_ativo === '1' ? 'text-success' : 'text-secondary'">{{t.fg_ativo === '1' ? 'Ativado' : 'Desativado'}}</span>
                          <img class="switch" src="../assets/icons/switch-on.svg" v-show="t.fg_ativo === '1'">
                          <img class="switch" src="../assets/icons/switch-off.svg" v-show="t.fg_ativo === '2'">
                        </div>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <div class="d-flex" style="padding-top: 18vh">
              <div class="m-auto text-center">
                <img src="../assets/logo-lecard.png" alt="Logo Lecard" style="width: 64px;">
                <div class="small mt-3">Você ainda não tem cadastro de produtos neste cardápio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import TopBar from '@/components/TopBar.vue'
  import HelloWorld from '@/components/HelloWorld.vue'
  import {Money} from 'v-money'

  export default {
    name: 'Cardapio',
    components: {
      HelloWorld, TopBar, Money
    },

    data() {
      return {
        loading: true,
        token: localStorage.getItem('key'),

        selCategoria: [],
        selProduto: [],
        categorias: [],
        produtos: [],
        searchResult: [],
        term: '',
        empresas: [],

        options: {
          shouldSort: true,
          threshold: 0.2,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: [
            "nome_produto",
            "nome_categoria",
            "tabelas.nome_tabela",
          ],
        },
      }
    },

    methods: {
      buscarProdutos(callback) {
        this.loading = true;
        this.$http.get('delivery/cardapio/'  + this.token)
          .then(response => {
            this.categorias = response.data;
            this.atualizarTabelas();
            this.loading = false;

            if (callback) {
              callback()
            }

          }, res => {
            console.log(res);
            this.loading = false;
            if (res.status === 401) {
              this.$swal(res.data.result, res.data.msg);
              this.$emit('logout');
            }
          });
      },

      atualizarTabelas() {
        this.produtos = [];
        this.categorias.forEach(c => {
          this.produtos = this.produtos.concat(c.produtos.map(p => {
            return {
              ...p,
              'nome_categoria': c.nome_categoria
            }
          }))
        });
      },

      pesquisar() {
        if (this.term.length) {
          this.$search(this.term, this.produtos, this.options).then(results => {
            this.searchResult = results;
            const qtd = results.length;

            if (qtd > 0 && qtd < 4) {
              this.selProduto.push(this.searchResult[0].id_produto);

            } else {
              this.selProduto = [];
            }
          })
        } else {
          this.clear();
        }
      },

      clear() {
        this.term = '';
        this.searchResult = [];
        this.selCategoria = [];
        this.selProduto = [];
      },

      toogleCategoria(c) {
        if (!this.selCategoria.includes(c.id_categoria)) {
          this.selCategoria.push(c.id_categoria);
        } else {
          this.selCategoria = [];
        }
      },

      toogleProduto(p) {
        if (!this.selProduto.includes(p.id_produto)) {
          this.selProduto.push(p.id_produto);
        } else {
          this.selProduto = [];
        }
      },

      editarValor(t, id) {
        if (!this.adm) {
          return;
        }

        if (t.valor < 0) {
          this.$swal('','A tabela de preço não pode ser menor que R$0,00');
          return;
        }

        let btn = document.getElementById(id + t.id_tabela_preco);
        btn.innerText = 'Salvo';
        btn.classList.add('salved');

        setTimeout(() => {
          btn.innerText = 'Alterar';
          btn.classList.remove('salved');
        }, 2000);

        this.$http.post('produto/tabela/' + this.token, t)
          .then(response => {
            this.atualizarTabelas();

          }, res => {
            console.log(res);
            this.$swal('', res.data.msg ? res.data.msg : 'Erro temporário');
          });
      },

      editarProduto(p) {
        this.editar(p, 2);
      },

      editarTabela(t, p) {
        if (p.fg_ativo === '1') {
          this.editar(t, 3);
        }
      },

      editar(c, tipo) {
        let dados;

        let delivery = c.fg_ativo === '1' ? '2' : '1';
        c.fg_ativo = delivery;

        if (tipo === 2) {
          dados = {
            id_produto: c.id_produto,
            delivery: delivery,
            tipo: tipo
          }

        } else {
          dados = {
            id_tabela_preco: c.id_tabela_preco,
            delivery: delivery,
            tipo: tipo
          }
        }

        this.$http.post('delivery/produto/status/' + this.token, dados)
          .then(response => {
            this.atualizarTabelas();

          }, res => {
            console.log(res);
            this.$swal('', res.data.msg ? res.data.msg : 'Erro temporário');
          });
      },

      acessarEmpresa() {
        this.loading = true;

        const term = this.term;
        this.clear();

        this.buscarProdutos(() => {
          if (term) {
            this.term = term;
            this.pesquisar();
          }
        });
      }
    },

    mounted() {
      this.empresas = this.$store.state.empresas;
      this.buscarProdutos();
    },

    computed: {
      adm() {
        return this.$store.state.dataUser.id_funcao === '1'
      }
    },

    filters: {
      cardapio(val) {
        switch (val) {
          case "1":
            return "Principal";
          case "2":
            return "Delivery";
          case "3":
            return "PDV"
        }
      }
    }
  }
</script>
<style scoped>
  .visibility {
    visibility: hidden;
  }

  .btn-edit {
    width: 80px;
  }

  .salved {
    background-color: #28a745!important;
    border-color: #28a745!important;;
  }
</style>
