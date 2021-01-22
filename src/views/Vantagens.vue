<template>
  <div>
    <top-bar/>
    <div class="content">
      <div class="container-fluid pt-4">
        <div class="d-flex" style="height: 75vh" v-if="load">
          <div class="m-auto text-center">
            <img src="../assets/logo-lecard.png" class="animated flipInY infinite" alt="Logo Lecard" style="width: 64px;">
            <div class="small mt-3 font-weight-bold">Carregando os dados..</div>
          </div>
        </div>
        <div v-show="!load">
          <div class="row no-gutters">
            <div class="col-md-5 pr-3">
              <h5 class="font-weight-bold mb-3">Validador de Vouchers</h5>
              <div class="card">
                <div class="card-body">
                  <div class="form-group">
                    <label class="mb-0" for="voucher">Código do Voucher</label>
                    <input type="text" id="voucher" class="form-control" placeholder="Ex: V100232" v-model="dados.voucher" @keyup.enter="validarVoucher"/>
                  </div>
                  <button class="btn btn-dark btn-block" @click="validarVoucher" :disabled="loadVoucher">
                    {{loadVoucher ? 'Validando..' : 'Validar Voucher'}}
                  </button>
                </div>
              </div>
            </div>
            <div class="col-md-7">
              <h5 class="font-weight-bold mb-3">Programa de Vantagens - Benefícios</h5>
              <div class="table-responsive" style="min-height: 300px">
                <table class="table table-striped border">
                  <tr class="border">
                    <th>Benefício</th>
                    <th class="text-center">Status</th>
                  </tr>
                  <tr v-for="d in fidelidade.beneficios">
                    <td @click="selBeneficio(d)">
                      {{d.pontos}} Pontos -
                      {{d.titulo}}
                    </td>
                    <td class="text-center pointer" @click="toggleBeneficio(d)">
                      <img class="switch" src="../assets/icons/switch-on.svg" v-show="d.status === '1'">
                      <img class="switch" src="../assets/icons/switch-off.svg" v-show="d.status === '0'">
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
</template>

<script>
  import TopBar from '@/components/TopBar.vue'

  export default {
    name: 'Vantagens',
    components: { TopBar },
    data() {
      return {
        load: true,
        loadVoucher: false,
        token: localStorage.getItem('key'),
        fidelidade: {
          beneficios: []
        },
        dados: {
          voucher: ''
        }
      }
    },

    methods: {
      buscarDados() {
        this.load = true;
        this.$http.get('fidelidade/' + this.token)
          .then(response => {
            this.load = false;
            this.fidelidade = response.data;

          }, res => {
            this.load = false;
            this.$swal(res.data.result, res.data.msg);
          })
      },

      validarVoucher() {
        if (this.loadVoucher) {
          return;
        }

        this.loadVoucher = true;
        this.$http.post('voucher/validar/' + this.token, this.dados)
          .then(res => {
            this.loadVoucher = false;

            if (res.data.result) {
              this.$swal("Sucesso", res.data.msg, "success");
              this.dados.voucher = '';

            } else {
              this.$swal(res.data.result, res.data.msg, "warning");
            }

          }, res => {
            this.loadVoucher = false;
            this.$swal(res.data.result,res.data.msg);
          });
      },

      toggleBeneficio(dados) {
        if (dados.tipo_beneficio === '1' && !dados.id_cupom) {
          this.$swal('Cupom não vinculado!',"Selecione um cupom para este benefício antes de ativa-lo");
          return;
        }

        dados.status = dados.status === '1' ? '0' : '1';
        this.$http.post("fidelidade/beneficios/" + this.token, dados)
          .then(res => {}, res => {
            console.log(res);
            this.load = false;
            this.$swal(res.data.result,res.data.msg);
            dados.status = dados.status === '1' ? '0' : '1';
          });
      }
    },

    created() {
      this.buscarDados();
    },

    computed: {
      adm() {
        return this.$store.state.dataUser.id_funcao === '1'
      }
    }
  }
</script>
