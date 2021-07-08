<template>
  <div style="position: relative">
    <div id="mapContainer" v-if="showMap && center">
      <l-map
          :zoom="zoom"
          :center="center"
          :options="mapOptions"
          @ready="mapReady"
        >
        <l-tile-layer :url="url" :attribution="attribution"/>
        <l-marker :lat-lng="empresa.coordinates" v-if="empresa">
          <l-popup>
            {{empresa.nome_fantasia}}
          </l-popup>
          <l-icon
              :icon-size="[48, 48]" :icon-anchor="[24, 48]" :popupAnchor="[0,-40]"
              :icon-url="require('../assets/icons/restaurant-icon.svg')"
          />
        </l-marker>
        <l-marker :lat-lng="p.coordinates" v-for="(p, index) in pedidos" v-if="pedidos.length" :key="index">
          <l-icon :icon-size="[32, 32]" :icon-anchor="[16, 32]" :popupAnchor="[0,-32]"
                  :icon-url="require('../assets/icons/location.svg')"/>
          <l-popup>
            <div>
              <div :class="p.status === '5' ? 'text-danger' : 'text-dark'">
                Pedido: {{p.id_pedido}} - {{p.data_pedido}}
              </div>
              <div>
                <b class="mr-1">Status:</b>
                <span class="badge badge-danger" v-if="p.status === '1'">Aguardando</span>
                <span class="badge badge-dark" v-if="p.status === '4'">Finalizado</span>
                <span class="badge border border-danger text-danger" v-if="p.status === '5'">Cancelado</span>
                <div class="d-inline-block" v-if="!p.id_entrega && p.origin !== '4'">
                  <span class="badge badge-info" v-show="p.status === '2'">Preparando</span>
                  <span class="badge badge-dark" v-show="p.status === '3'">Entregando</span>
                </div>
                <div class="d-inline-block" v-else-if="p.id_entrega && p.status <= 3">
                  <span class="badge badge-warning">Agendado</span>
                </div>
              </div>
              <div>
                <b>Cliente:</b> {{p.nome_cliente}}
              </div>
              <div>
                {{p.logradouro}}, {{p.numero}}, {{p.bairro}}
              </div>
            </div>
          </l-popup>
        </l-marker>
      </l-map>
    </div>
    <div style="padding-top: 28vh" v-else>
      <img src="../assets/logo-lecard.png" class="d-block m-auto animated flipInY infinite" alt="Logo Lecard" style="width: 72px;">
    </div>
  </div>
</template>

<script>
  import { latLng, Icon, point } from "leaflet";
  import { LMap, LTileLayer, LMarker, LPopup, LTooltip , LControl, LIcon, LCircle } from "vue2-leaflet";

  delete Icon.Default.prototype._getIconUrl;
  Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
  });

  // iconRetinaUrl: require('../assets/icons/location.svg'),
  //   iconUrl: require('../assets/icons/location.svg'),
  //   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),

  export default {
    name: "MapLeaflet",
    components: { LMap, LTileLayer, LMarker, LPopup, LTooltip, LControl, LIcon, LCircle },

    data() {
      return {
        map: null,
        showMap: false,
        zoom: 15,
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        mapOptions: { zoomSnap: 0.5, minZoom: 13, maxZoom: 17 },

        pedido: null,
        empresa: null,
        pedidos: [],

        center: '',
        showTooltip: true,
        tooltipOption: { permanent: true, direction: 'top', offset: point([-16, -24])},
      };
    },

    methods: {
      mapReady(m) {
        this.map = m;
      }
    },

    created() {
      this.$parent.$on('loadDadosModal', (dados) => {
        this.showMap = false;

        setTimeout(() => {
          this.empresa = {
            nome_fantasia: dados.nome_fantasia,
            coordinates: latLng(dados.lat_empresa, dados.long_empresa)
          };

          if (dados.pedido) {
            this.pedido = {
              ...dados,
              coordinates: latLng(dados.pedido.lat_endereco, dados.pedido.long_endereco),
            };

            this.center = this.pedido.coordinates;
          }

          if (dados.pedidos) {
            this.pedidos = dados.pedidos.map((p) => {
              return {
                ...p,
                coordinates: latLng(p.lat_endereco, p.long_endereco)
              }
            })
          }

          this.showMap = true;

        }, 1200);
      });

      this.$parent.$on('closeModal', () => {
        this.center = null;
        this.showMap = false;
      });
    }
  };
</script>
<style>
  #mapContainer {
    height: calc(100vh - 132px);
  }
</style>
