const { app, BrowserWindow, ipcMain, dialog, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');
const store = require('./store');
const ifood = require('./ifood');

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Ha duas instancias abertas');
  app.quit();
  return;
}

const env = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));
let BASE_GESTOR = env.BASE_GESTOR;
let isHomolog = false;

if (store.get('IS_HOMOLOG')) {
  isHomolog = true;
  BASE_GESTOR = env.BASE_GESTOR_HHH;
}

let splash = null;
let win = null;
let winP = null;
let windPDF = null;
let windows = [];
let printers = [];
let listPrint = [];
let isPrinting = false;
let showVersionAvaliable = false;

app.disableHardwareAcceleration();
app.userAgentFallback = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';
app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');
app.setAppUserModelId('delivery.lecard.gestor');
Menu.setApplicationMenu(createMenuContext());

app.whenReady().then(() => {
  win = createBrowser(false);

  win.loadURL(BASE_GESTOR).then(() => {}).catch(() => {
    win.loadFile('pages/error.html');
  });

  splash = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    icon: path.join(__dirname, 'icon.png')
  });

  splash.loadFile('pages/loading.html');

  win.once('ready-to-show', () => {
    setTimeout(() => {
      splash.close();

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
      win.show();
      win.focus();

    }, 2000)
  });

  win.on('closed', () => {
    win = null;
    app.quit();
  });

  win.on('close', async (e) => {
    e.preventDefault();

    if (!windows.length) {
      win.destroy();

    } else {
      const { response } = await dialog.showMessageBox(win, {
        type: 'question',
        title: '  Confirme  ',
        message: `Ao continuar todas as janelas abertas serão fechadas. Deseja encerar o sistema?`,
        buttons: ['Sim', 'Não'],
      });

      response === 0 && win.destroy();
    }
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

    for (let i=0; i < windows.length; i++) {
      windows[i].webContents.openDevTools();
    }
  });

  loadDendences();
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

function createBrowser(new_page) {
  return new BrowserWindow({
    width: 1100,
    height: 650,
    minWidth: 600,
    minHeight: 650,
    title: 'Gestor LeCard',
    backgroundColor: '#9454f0',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, new_page ? 'preload-read.js' : 'preload.js')
    },
    icon: path.join(__dirname, 'icon.png')
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

      setTimeout(() => {
        if (isPackaged && !showVersionAvaliable) {
          autoUpdater.checkForUpdates();
        }
      }, (10000));
    });
  });

  ipcMain.on('gopage', (evt, opt) => {
    if (!opt) {
      return;
    }

    if (opt.new_window || !windows.length) {
      openPage(opt);

    } else if (windows.length) {
      windows[0].focus();
    }
  });

  ipcMain.on('notification', (play) => {
    if (play) {
      win.flashFrame(true);

    } else {
      win.flashFrame(false);
    }
  });

  ipcMain.on('ifoodEvent', (event, option) => {
    ifood.pollingAPI(win, option).then();
  });

  ipcMain.on('openPDF', (evt, opt) => {
    if (!opt) {
      return;
    }

    if (!windPDF) {
      windPDF = new BrowserWindow({
        width: 400,
        minWidth: 400,
        height: 650,
        minHeight: 650,
        show: true,
        title: opt.title || 'Impressão PDF',
        backgroundColor: '#323539',
        icon: path.join(__dirname, 'icon.png')
      });
    }

    windPDF.loadURL(opt.url);
    windPDF.focus();
  });

  if (isPackaged) {
    checkAutoUpdater();
  }

  setPrinters(win);
}

function openPage(opt) {
  if (!opt || !opt.url) {
    return;
  }

  let new_page = createBrowser(true);
  new_page.loadURL(opt.url);

  new_page.once('ready-to-show', () => {
    new_page.show();
    new_page.focus();
    new_page.webContents.executeJavaScript(`sessionStorage.setItem('isReadOnly',${windows.length});`);
    setPrinters(new_page);
  });

  new_page.on('closed', () => {
    windows = windows.filter(w => w !== new_page);
    new_page = null;
  });

  new_page.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  windows.push(new_page);
}

function setPrinters(w) {
  printers = w.webContents.getPrinters();
  const version = app.getVersion();
  const strCPrinter = JSON.stringify(printers);
  let code = `sessionStorage.setItem('Printers',${JSON.stringify(strCPrinter)}); sessionStorage.setItem('ElectronV', '${version}'); `;
  w.webContents.executeJavaScript(code);
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
          label: (isHomolog ? 'Modo produção' : 'Modo de teste'),
          enabled: true,
          click() {
            const dialogOpts = {
              type: 'info',
              buttons: ['Cancelar', 'Sim'],
              title: 'Alternar sistema',
              message: "",
              detail: 'Deseja alterar este sistema para ' + (isHomolog ? 'produção?' : 'o modo de teste?')
            };

            dialog.showMessageBox(win, dialogOpts, null).then((returnValue) => {
              if (returnValue.response !== 0) {
                if (isHomolog) {
                  store.delete('IS_HOMOLOG');

                } else {
                  store.set('IS_HOMOLOG', 'true');
                }

                app.relaunch();
                app.quit();
              }
            });
          },
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
  autoUpdater.on('update-downloaded', () => {
    const dialogOpts = {
      type: 'info',
      buttons: ['OK'],
      title: 'Nova versão disponível!',
      message: "",
      detail: 'Uma nova versão foi baixada, por favor reinicie o sistema para atualizar.'
    };

    dialog.showMessageBox(win, dialogOpts, null);
  });

  autoUpdater.on('error', (ev, message) => {
    if (showVersionAvaliable) {
      const dialogOpts = {
        type: 'info',
        buttons: ['OK'],
        title: 'Erro na atualização',
        message: 'Erro ao tentar atualizar',
        detail: message
      };

      dialog.showMessageBox(win, dialogOpts, null);
    }
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