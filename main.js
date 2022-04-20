const { app, BrowserWindow, ipcMain, dialog, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const elStore = require('electron-store');

const env = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));
let BASE_GESTOR = env.BASE_GESTOR;
let BASE_COMANDA = env.BASE_COMANDA;

let win = null;
let winP = null;
let winC = null;
let printers = [];
let listPrint = [];
let isPrinting = false;
let showVersionAvaliable = false;
let store = new elStore();
const isComanda = !!store.get("isComanda");

app.userAgentFallback = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';
app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');
app.setAppUserModelId('delivery.lecard.gestor');
Menu.setApplicationMenu(createMenuContext());

app.whenReady().then(() => {
  win = createBrowser(isComanda ? 'comanda.png' : 'icon.png');
  win.loadFile("pages/loading.html");

  win.once('ready-to-show', () => {
    win.show();

    setTimeout(() => {
      win.loadURL(isComanda ? BASE_COMANDA : BASE_GESTOR).then(() => {}).catch(() => {
        win.loadFile('pages/error.html');
      });

      win.webContents.on('new-window', function(e, url) {
        e.preventDefault();
        require('electron').shell.openExternal(url);
      });

      winP = new BrowserWindow({
        width: 1000,
        show: false,
        title: 'Impressao'
      });

      winP.loadFile("pages/print.html");

      loadDendences();
    }, 2000)
  });

  win.on('closed', () => {
    app.quit();
  });

  win.once('focus', () => win.flashFrame(false));

  app.on('activate', function () {
    // if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });

  globalShortcut.register('CommandOrControl+L', () => {
    win.webContents.openDevTools();

    if (winC) {
      winC.webContents.openDevTools();
    }
  });
});

app.on('window-all-closed', function () {
  app.quit()
});

app.on('web-contents-created', (e, contents) => {
  if (contents.getType() === 'webview') {
    contents.on('new-window', (e, url) => {
      e.preventDefault();
      require('electron').shell.openExternal(url)
    })
  }
});

function createBrowser(icon) {
  return new BrowserWindow({
    width: 1100,
    height: 630,
    minWidth: 600,
    minHeight: 630,
    title: 'Gestor de Pedidos',
    backgroundColor: '#fb5010',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, icon)
  });
}

function printData(option, callback) {
  if (!option || !option.content) {
    callback();
    return;
  }

  const impressora = option.impressora || {};
  const content = JSON.stringify(`${option.content}`);
  const zoom = impressora.zoom ? impressora.zoom : "9px";
  const width = impressora.largura ? impressora.largura : "100%";
  const deviceName = impressora.device ? impressora.device : "";
  const id_impressao = option.id_impressao;
  const copies = option.copies ? parseInt(option.copies) : 1;

  const config = { silent: true };

  if (deviceName && !printers.find(p => p.displayName === deviceName)) {
    callback({id_impressao, status: 4, erro: "Não foi possível encontrar a impressora selecionada: " + deviceName});
    return;

  } else if (deviceName) {
    config.deviceName = deviceName
  }

  const script = `
    document.getElementById('content').innerHTML = ${content};
    document.body.style.fontSize = '${zoom}';
    document.body.style.width = '${width}';
  `;

  try {
    winP.webContents.executeJavaScript(script).then(() => {

      try {
        winP.webContents.print(config);

        if (copies > 1) {
          setTimeout(() => {
            winP.webContents.print(config);
            callback();
          }, 1500);

        } else {
          callback({id_impressao, status: 3});
        }

      } catch (err) {
        callback();
        // dialogMsg("Não foi possível imprimir","Verifique se a impressora selecionada está disponível e tente novamente.")
      }

    }).catch(e => {
      callback();
      console.log(e)
    });

  } catch (e) {
    callback({id_impressao, status: 4, erro: "Não foi possível imprimir. Tente novamente."});
    dialogMsg("Não foi possível imprimir","Tente novamente.")
  }
}

function dialogMsg(title, message) {
  dialog.showMessageBox(win, {
    type: 'info',
    buttons: ['OK'],
    title,
    message
  }, null);
}

function loadDendences() {
  const isPackaged = app.isPackaged;

  if (isPackaged) {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe')
    });
  }

  // ipcmain
  ipcMain.on('print', (event, option) => {
    listPrint.push(option);
    printFila(event);
  });

  ipcMain.on('showDialog', (event, option) => {
    dialog.showMessageBox(win, option, null);
  });

  ipcMain.on('reloadUrl', () => {
    win.loadURL(BASE_GESTOR).then(() => {}).catch(() => {
      win.loadFile('pages/error.html');
    });
  });

  ipcMain.on('gopage', (evt, opt) => {
    if (winC) {
      winC.focus();
      return;
    }

    winC = createBrowser('comanda.png');
    winC.loadURL(opt);

    winC.once('ready-to-show', () => {
      winC.show();
      winC.focus();

      const strCPrinter = JSON.stringify(printers);
      winC.webContents.executeJavaScript(`sessionStorage.setItem('Printers',${JSON.stringify(strCPrinter)}); sessionStorage.setItem('ElectronV', '${version}')`);
    });

    winC.on('closed', () => {
      winC = null;
    });

    winC.webContents.on('new-window', function(e, url) {
      e.preventDefault();
      require('electron').shell.openExternal(url);
    });
  });

  ipcMain.on('notification', (play) => {
    if (play) {
      win.flashFrame(true);

    } else {
      win.flashFrame(false);
    }
  });

  const version = app.getVersion();

  printers = win.webContents.getPrinters();
  const strPrinter = JSON.stringify(printers);

  win.webContents.executeJavaScript(`sessionStorage.setItem('Printers',${JSON.stringify(strPrinter)}); sessionStorage.setItem('ElectronV', '${version}')`).then(() => {
    if (isPackaged) {
      checkAutoUpdater();
    }
  });
}

function printFila(event) {
  if (!isPrinting && listPrint.length) {
    isPrinting = true;

    printData(listPrint[0], (res) => {
      listPrint.splice(0,1);

      if (res) {
        event.reply('was-printed', res);
      }

      setTimeout(() => {
        isPrinting = false;
        printFila(event);
      }, 1500);
    });
  }
}

function createMenuContext(){
  const menus = [
    {
      label: 'Configs',
      submenu: [
        {
          label: (isComanda ? 'Alternar para o gestor' : 'Alternar para a comanda'),
          enabled: true,
          click() {
            const dialogOpts = {
              type: 'info',
              buttons: ['Cancelar', 'Sim'],
              title: 'Alternar sistema',
              message: "",
              detail: 'Deseja alterar este sistema para ' + (isComanda ? 'o gestor?' : 'a comanda?')
            };

            dialog.showMessageBox(win, dialogOpts, null).then((returnValue) => {
              if (returnValue.response !== 0) {
                if (isComanda) {
                  store.delete('isComanda');
                } else {
                  store.set('isComanda', 'true');
                }

                app.relaunch();
                app.quit();
              }
            });
          },
        }
      ]
    },
    {
      label: 'Ajuda',
      submenu: [
        {
          label: 'Verificar atualizações',
          enabled: true,
          click() {
            showVersionAvaliable = true;
            autoUpdater.checkForUpdates()
          },
        },
        {
          label: 'Licença',
          click: () => {
            dialog.showMessageBox(win, {
              type: 'info',
              buttons: ['OK'],
              title: 'Lincença',
              message: 'Status: Ativo\nVersão: ' + app.getVersion()
            }, null);
          }
        },
      ]
    },
    {
      label: 'Editar',
      submenu: [
        {
          label: 'Desfazer',
          accelerator: 'CmdOrCtrl+Z',
          role: 'undo',
        },
        {
          label: 'Refazer',
          accelerator: 'Shift+CmdOrCtrl+Z',
          role: 'redo',
        },
        {
          type: 'separator',
        },
        {
          label: 'Cortar',
          accelerator: 'CmdOrCtrl+X',
          role: 'cut',
        },
        {
          label: 'Copiar',
          accelerator: 'CmdOrCtrl+C',
          role: 'copy',
        },
        {
          label: 'Colar',
          accelerator: 'CmdOrCtrl+V',
          role: 'paste',
        },
        {
          label: 'Selecionar',
          accelerator: 'CmdOrCtrl+A',
          role: 'selectAll',
        }
      ]
    }
  ];

  return Menu.buildFromTemplate(menus);
}

function checkAutoUpdater() {
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, (1000*60));

  autoUpdater.on('update-downloaded', () => {
    try {
      const dialogOpts = {
        type: 'info',
        buttons: ['Reiniciar', 'Mais tarde'],
        title: 'Aplicação atualiza',
        message: "",
        detail: 'Uma nova versão foi baixada, por favor, reinicie para aplicar as mudanças.'
      };

      dialog.showMessageBox(win, dialogOpts, null).then((returnValue) => {
        if (returnValue.response === 0) autoUpdater.quitAndInstall()
      });

    } catch (error) {
      autoUpdater.quitAndInstall();
    }
  });

  autoUpdater.on('error', message => {
    const dialogOpts = {
      type: 'info',
      buttons: ['OK'],
      title: 'Erro na atualização',
      message: "",
      detail: 'Ocorreu um erro ao tentar atualizar.'
    };

    dialog.showMessageBox(win, dialogOpts, null);
  });

  autoUpdater.on('update-available', (args) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['OK'],
      title: 'Atualização',
      message: "",
      detail: 'Uma nova versão será baixada, espere um momento que irá atualizar sozinha.'
    };

    dialog.showMessageBox(win, dialogOpts, null);
  });

  autoUpdater.on('update-not-available', (args) => {
    if (showVersionAvaliable){
      const dialogOpts = {
        type: 'info',
        buttons: ['OK'],
        title: 'Versão já está atualizada',
        message: "",
        detail: 'Sua versão já está atualizada.'
      };

      dialog.showMessageBox(win, dialogOpts, null);
    }
  });
}
