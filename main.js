const { app, BrowserWindow, ipcMain, dialog, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const store = require('./store');

const env = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));
let BASE_GESTOR = env.BASE_GESTOR;
let BASE_COMANDA = env.BASE_COMANDA;

if (store.get('BASE_GESTOR')) {
  BASE_GESTOR = store.get('BASE_GESTOR');
}

if (store.get('BASE_COMANDA')) {
  BASE_COMANDA = store.get('BASE_COMANDA');
}

let win = null;
let winP = null;
let winC = null;
let printers = [];
let listPrint = [];
let isPrinting = false;
let showVersionAvaliable = false;
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
      win.focus();

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

  win.webContents.on('did-fail-load', () => {
    win.loadFile('pages/error.html');
  })

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
  const id_cozinha = impressora.id_cozinha || null;
  const id_impressao = option.id_impressao || null;
  const copies = option.copies ? parseInt(option.copies) : 1;

  const config = { silent: true };

  if (deviceName && !printers.find(p => p.displayName === deviceName)) {
    callback({id_impressao, status: 4, erro: "Não foi possível encontrar a impressora: " + deviceName});
    return;

  } else if (deviceName) {
    config.deviceName = deviceName
  }

  const script = `
    document.getElementById('content').innerHTML = ${content};
    document.body.style.fontSize = '${zoom}';
    document.body.style.width = '${width}';
    filtrarCozinha(${id_cozinha});
  `;

  try {
    winP.webContents.executeJavaScript(script).then(() => {
      print(config, (erro) => {
        if (!erro && copies > 1) {
          setTimeout(() => {
            print(config, (erro) => {
              if (!erro) {
                callback({id_impressao, status: 3});

              } else {
                callback({id_impressao, status: 4, erro});
              }
            });
          }, 1500);

        } else if (!erro) {
          callback({id_impressao, status: 3});

        } else {
          callback({id_impressao, status: 4, erro});
        }
      });

    }).catch(e => {
      callback();
      console.log(e);
    });

  } catch (e) {
    callback({id_impressao, status: 4, erro: "Não foi possível imprimir. Tente novamente."});
    // dialogMsg("Não foi possível imprimir","Tente novamente.")
  }
}

function print(config, callback) {
  winP.webContents.print(config, (success, failureReason) => {
    callback(success ? null : failureReason);
  });
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
    // app.setLoginItemSettings({
    //   openAtLogin: true,
    //   path: app.getPath('exe')
    // });
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

    win.once('ready-to-show', () => {
      setPrinters(win);
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
      setPrinters(winC);
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

  if (isPackaged) {
    checkAutoUpdater();
  }

  setPrinters(win);
}

function setPrinters(w) {
  printers = w.webContents.getPrinters();
  const version = app.getVersion();
  const strCPrinter = JSON.stringify(printers);
  w.webContents.executeJavaScript(`sessionStorage.setItem('Printers',${JSON.stringify(strCPrinter)}); sessionStorage.setItem('ElectronV', '${version}')`);
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
        },
        {
          label: "Abrir arquivo de configuração",
          enabled: true,
          click() {
            store.openInEditor();
          }
        },
        {
          label: (win && win.isFullScreen() ? "Sair" : "Modo") + " FullScrean",
          enabled: true,
          click() {
            if (win) {
              win.setFullScreen(!win.isFullScreen());
              Menu.setApplicationMenu(createMenuContext());
            }
          }
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
    if (!showVersionAvaliable) {
      autoUpdater.checkForUpdates();
    }
  }, (30000));

  autoUpdater.on('update-downloaded', () => {
    const dialogOpts = {
      type: 'info',
      buttons: ['OK'],
      title: 'Nova versão disponível!',
      message: "",
      detail: 'Uma nova versão foi baixada, por favor aguarde enquanto atualizamos o sistema'
    };

    dialog.showMessageBox(win, dialogOpts, null);

    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 10000);
  });

  autoUpdater.on('error', (ev, message) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['OK'],
      title: 'Erro na atualização',
      message: 'Erro ao tentar atualizar',
      detail: message
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

  autoUpdater.on('download-progress', (progressObj) => {
    win.setProgressBar(progressObj.percent / 100);
  })
}