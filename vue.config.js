module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        appId: "delivery.lecard.gplecard-2",
        productName: "LeCard - Gestor de Pedidos 2",
        artifactName: 'gestor-lecard-2-${version}.${ext}',
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
