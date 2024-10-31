const { app, BrowserWindow, ipcMain, dialog, Menu, globalShortcut, session, powerSaveBlocker} = require('electron');
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
let isBeta = false;

if (store.get('IS_HOMOLOG')) {
  isHomolog = true;
  BASE_GESTOR = env.BASE_GESTOR_HHH;

} else if (store.get('IS_BETA')) {
  isBeta = true;
  BASE_GESTOR = env.BASE_GESTOR_BETA;
}

let splash = null;
let win = null;
let winP = null;
let windows = [];
let wExternal = null;
let printers = [];
let listPrint = [];
let isPrinting = false;
let showVersionMenu = false;
let idPowerSave = null;
const version = app.getVersion();

app.disableHardwareAcceleration();

app.commandLine.appendSwitch('disable-site-isolation-trials')
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')
app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');
app.commandLine.appendSwitch("disable-background-timer-throttling");

app.userAgentFallback = `LeCard/${version} (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36`;
app.setAppUserModelId('delivery.lecard.gestor');
Menu.setApplicationMenu(createMenuContext());

app.whenReady().then(() => {
  splash = new BrowserWindow({
    width: 500,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    icon: path.join(__dirname, 'icon.png')
  });

  splash.loadFile('pages/loading.html');

  winP = new BrowserWindow({ width: 1000, show: false, title: 'Impressao' });
  winP.loadFile("pages/print.html");

  winP.once('ready-to-show', () => {
    createMain();
  });

  app.on('activate', function () {
    // if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });

  globalShortcut.register('CommandOrControl+L', () => {
    if (win) {
      win.webContents.openDevTools();

      for (let i=0; i < windows.length; i++) {
        windows[i].webContents.openDevTools();
      }
    }

    if (wExternal) {
      wExternal.webContents.openDevTools();
    }
  });

  loadDendences();

  if (!idPowerSave) {
    idPowerSave = powerSaveBlocker.start('prevent-display-sleep');
  }
});

app.on('window-all-closed', function () {
  if (idPowerSave) {
    console.log('closePowerSave');
    powerSaveBlocker.stop(idPowerSave)
  }

  app.quit()
});

function createMain() {
  win = createBrowser(false);

  win.loadURL(BASE_GESTOR).then(() => {}).catch(() => {
    win.loadFile('pages/error.html');
  });

  win.once('ready-to-show', () => {
    setPrinters(win);

    setTimeout(() => {
      splash.close();
      win.show();
      win.focus();
    }, 2000);
  });

  win.webContents.on('did-fail-load', () => {
    win.loadFile('pages/error.html');
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
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
}

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
      backgroundThrottling: new_page,
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
  const device = impressora.device ? impressora.device : "";
  const id_cozinha = impressora.id_cozinha || null;
  const id_impressao = option.id_impressao || null;
  const id_pedido = option.id_pedido || null;
  const copies = option.copies ? parseInt(option.copies) : 1;
  const config = { silent: true, id_cozinha };

  if (device && !printers.find(p => p.displayName === device)) {
    callback({id_impressao, id_pedido, status: 4, device, erro: "Não foi possível encontrar a impressora: " + device});
    return;

  } else if (device) {
    config.deviceName = device
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
          print(config, (erro) => {
            callback({id_impressao, id_pedido, erro, device, status: erro ? 4 : 3});
          });

        } else {
          callback({id_impressao, id_pedido, erro, device, status: erro ? 4 : 3});
        }
      });

    }).catch(e => {
      console.log(e);
      callback({id_impressao, id_pedido, status: 4, device, erro: "Não foi possível imprimir. Erro no Script."});
    });

  } catch (e) {
    console.log(e);
    callback({id_impressao, id_pedido, status: 4, device, erro: "Não foi possível imprimir. Tente novamente."});
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

    if (!isPrinting) {
      isPrinting = true;
      printFila(event);
    }
  });

  ipcMain.on('showDialog', (event, option) => {
    dialog.showMessageBox(win, option, null);
  });

  ipcMain.on('reloadUrl', () => {
    win.hide();

    win.loadURL(BASE_GESTOR).then(() => {
      win.show();

    }).catch(() => {
      win.show();
      win.loadFile('pages/error.html');
    });

    win.once('ready-to-show', () => {
      setPrinters(win);
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

  ipcMain.on('goPageExternal', (evt, opt) => {
    if (!opt) {
      return;
    }

    openPageExternal(opt.url);
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

  ipcMain.on('update', (event, option) => {
    if (option.outdate) {
      if (isPackaged) {
        showVersionMenu = false;
        autoUpdater.checkForUpdates();

      } else {
        dialog.showMessageBox(win, {
          type: 'info',
          buttons: ['OK'],
          title: 'Atualização',
          message: "Nova versão disponível",
          detail: 'Por favor não feche o sistema, aguarde estamos baixando a nova versão.'
        }, null);
      }

    } else {
      session.defaultSession.clearStorageData({
        storages: ['cookies', 'filesystem', 'cachestorage', 'indexdb', 'shadercache', 'websql', 'serviceworkers']
      }).then(res => {
        app.relaunch();
        app.quit();
      });
    }
  });

  if (isPackaged) {
    checkAutoUpdater();
  }
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

  new_page.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });

  windows.push(new_page);
}

function openPageExternal(url) {
  if (wExternal) {
    wExternal.loadURL(url).then(() => {
      wExternal.focus();
    });

  } else {
    wExternal = new BrowserWindow({
      width: 1100,
      height: 650,
      minWidth: 600,
      minHeight: 650,
      title: 'LeCard - Portal',
      icon: path.join(__dirname, 'icon.png')
    });

    wExternal.loadURL(url);

    wExternal.once('ready-to-show', () => {
      wExternal.focus();
    });

    wExternal.webContents.on('did-fail-load', () => {
      wExternal.loadFile('pages/errorExternal.html');
    });

    wExternal.on('closed', () => {
      wExternal = null;
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    });
  }
}

function setPrinters(w) {
  w.webContents.executeJavaScript(`window.ElectronV='${version}'; sessionStorage.setItem('ElectronV', '${version}');`);
  w.webContents.getPrintersAsync().then((devices) => {
    printers = devices;

    if (printers) {
      const strPrinters = printers ? JSON.stringify(JSON.stringify(printers)) : "[]";
      w.webContents.executeJavaScript(`sessionStorage.setItem('Printers',${strPrinters});`);
    }
  });
}

function printFila(event) {
  printData(listPrint[0], (res) => {
    listPrint.splice(0,1);

    if (res) {
      event.reply('was-printed', res);
    }

    if (listPrint.length) {
      printFila(event);

    } else {
      isPrinting = false;
    }
  });
}

function createMenuContext(){
  const menus = [
    {
      label: 'Configs',
      submenu: [
        {
          label: (isBeta ? 'Voltar versão Estável' : 'Habilitar versão Beta'),
          enabled: true,
          click() {
            const dialogOpts = {
              type: 'info',
              buttons: ['Cancelar', 'Sim'],
              title: 'Alternar versão',
              message: "",
              detail: 'Deseja alterar este sistema para a versão ' + (isBeta ? 'estável?' : 'beta?')
            };

            dialog.showMessageBox(win, dialogOpts, null).then((returnValue) => {
              if (returnValue.response !== 0) {
                if (isBeta) {
                  store.delete('IS_BETA');

                } else {
                  store.set('IS_BETA', 'true');
                }

                app.relaunch();
                app.quit();
              }
            });
          },
        },
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
            showVersionMenu = true;
            autoUpdater.checkForUpdates()
          },
        },
        {
          label: 'Versão',
          click: () => {
            dialog.showMessageBox(win, {
              type: 'info',
              buttons: ['OK'],
              title: 'Versão',
              message: 'Versão: ' + version
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
  autoUpdater.on('checking-for-update', () => {
    win.webContents.send('updateReply', {
      title: 'Atualização',
      message: 'Verificando atualização',
      detail: 'Só um momento, estamos aguardando a nova versão.',
      step: 1
    });
  });

  autoUpdater.on('update-available', () => {
    const dialogOpts = {
      type: 'info',
      buttons: ['OK'],
      title: 'Atualização',
      message: 'Baixando atualização',
      detail: 'Por favor não feche o sistema, estamos baixando a nova versão.'
    };

    if (showVersionMenu) {
      dialog.showMessageBox(win, dialogOpts, null);

    } else {
      dialogOpts.step = 2;
      win.webContents.send('updateReply', dialogOpts);
    }
  });

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('updateReply', {
      title: 'Atualização',
      message: "Versão baixada com sucesso!",
      detail: 'Instalando, por favor aguarde..',
      step: 3
    });

    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 3000);
  });

  autoUpdater.on('error', (ev, message) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['OK'],
      title: 'Atualização',
      message: 'Erro ao tentar atualizar',
      detail: message
    };

    if (showVersionMenu) {
      dialog.showMessageBox(win, dialogOpts, null);

    } else {
      dialogOpts.step = 4;
      win.webContents.send('updateReply', dialogOpts);
    }
  });

  autoUpdater.on('update-not-available', (args) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['OK'],
      title: 'Atualização',
      message: 'Tudo certo por aqui!',
      detail: 'Você já está usando a versão atual do sistema.'
    };

    if (showVersionMenu) {
      dialog.showMessageBox(win, dialogOpts, null);

    } else {
      dialogOpts.step = 5;
      win.webContents.send('updateReply', dialogOpts);
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    win.setProgressBar(progressObj.percent / 100);
    win.webContents.send('updateProgress', progressObj.percent);
  });
}