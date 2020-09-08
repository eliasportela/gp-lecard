<template>
  <div>
    <top-bar/>
    <div class="content">
      <div class="container-fluid">
        <div class="d-flex" style="height: 75vh" v-if="loading">
          <div class="m-auto text-center">
            <img src="../assets/logo-lecard.png" class="animated flipInY infinite" alt="Logo Lecard" style="width: 64px;">
            <div class="small mt-3 font-weight-bold">Carregando o cardápio..</div>
          </div>
        </div>
        <div id="categorias" class="pt-3" style="margin-bottom: 32px" v-show="!loading">
          <div class="mb-3" v-for="(c, index) in categorias">
            <!--categorias-->
            <div class="border pointer text-info bg-light">
              <div class="row">
                <div class="col-9 align-self-center" @click="toogleCategoria(c)">
                  <div class="p-3">
                    {{c.nome_categoria}}
                  </div>
                </div>
                <div class="col-3 align-self-center text-right">
                  <div class="p-3" @click="editar(c, 1)" :class="c.delivery === '1' ? 'text-success' : 'text-secondary'">
                    <span class="pr-2">{{c.delivery === '1' ? 'Ativado' : 'Desativado'}}</span>
                    <img class="switch" src="../assets/icons/switch-on.svg" v-show="c.delivery === '1'">
                    <img class="switch" src="../assets/icons/switch-off.svg" v-show="c.delivery === '0'">
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
                        <div class="d-inline-block pointer" @click="editarProduto(p, c)" :class="{'visibility': c.delivery === '0'}">
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
                        <th style="width: 250px">Valor</th>
                        <th style="width: 150px">&nbsp;</th>
                      </tr>
                    </thead>
                    <tr v-for="t in p.tabelas">
                      <td class="align-middle">
                        <div class="input-group mb-2">
                          <input type="text" class="form-control" v-model="t.nome_tabela" :disabled="t.outros !== '1' || !adm"/>
                          <div class="input-group-append" style="width: 100px" v-if="adm">
                            <button :id="'btnTabela' + t.id_tabela_preco" class="btn btn-dark btn-edit" @click="editarValor(t, 'btnTabela')" v-show="t.outros === '1'">Salvar</button>
                          </div>
                        </div>
                      </td>
                      <td class="align-middle">
                        <div class="input-group mb-2">
                          <money class="form-control" v-model="t.valor" :disabled="!adm"/>
                          <div class="input-group-append" style="width: 100px" v-if="adm">
                            <button :id="'btn' + t.id_tabela_preco" class="btn btn-dark btn-edit" @click="editarValor(t, 'btn')">Salvar</button>
                          </div>
                        </div>
                      </td>
                      <td class="align-middle">
                        <div class="p-2 pointer" @click="editarTabela(t, p, c)" :class="{'visibility': p.fg_ativo === '2' || c.delivery === '0'}">
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
      </div>
    </div>
  </div>
</template>

<script>
import TopBar from '@/components/TopBar.vue'
import HelloWorld from '@/components/HelloWorld.vue'
import {Money} from 'v-money'

export default {
  name: 'Home',
  components: {
    HelloWorld, TopBar, Money
  },
  data() {
    return {
      loading: true,
      selCategoria: [],
      selProduto: [],
      adm: localStorage.getItem('administrativo') === 'true',
      token: localStorage.getItem('key'),
      categorias: []
    }
  },
  methods: {
    buscarProdutos() {
      this.$http.get('delivery/cardapio/'  + this.token)
        .then(response => {
          this.loading = false;
          this.categorias = response.data;
        }, res => {
          console.log(res);
          this.loading = false;
          this.$emit('logout');
        });
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

      let btn = document.getElementById(id + t.id_tabela_preco);
      btn.innerText = 'Salvo';
      btn.classList.add('salved');

      setTimeout(() => {
        btn.innerText = 'Alterar';
        btn.classList.remove('salved');
      }, 2000);

      this.$http.post(this.urlBase + 'produto/tabela/' + this.token, t)
        .then(response => {

        }, res => {
          console.log(res);
          this.$swal('', res.data.msg ? res.data.msg : 'Erro temporário');
        });
    },

    editarProduto(p, c) {
      if (c.delivery === '1') {
        this.editar(p, 2);
      }
    },

    editarTabela(t, p, c) {
      if (c.delivery === '1' && p.fg_ativo === '1') {
        this.editar(t, 3);
      }
    },

    editar(c, tipo) {
      let dados;

      if (tipo === 1) {
        let delivery = c.delivery === '1' ? '0' : '1';
        c.delivery = delivery;

        dados = {
          id_categoria: c.id_categoria,
          delivery: delivery,
          tipo: tipo
        }

      } else {
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
      }

      this.$http.post('delivery/produto/status/' + this.token, dados)
        .then(response => {
          // console.log(response.data.status);

        }, res => {
          console.log(res);
          this.$swal('', res.data.msg ? res.data.msg : 'Erro temporário');
        });
    }
  },
  mounted() {
    this.buscarProdutos()
  }
}
</script>
<style scoped>
  .switch {
    width: 32px;
  }

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
