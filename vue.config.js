module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "delivery.lecard.gplecard",
        productName: "Gestor de Pedidos",
        artifactName: 'gestor-lecard-${version}.${ext}',
        publish: ['github'],
        win: {
          target: [
            {
              target: "nsis",
              arch: [
                "x64",
                "ia32"
              ]
            }
          ]
        }
      }
    }
  }
}
