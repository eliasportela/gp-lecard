const { app, protocol, BrowserWindow, ipcMain, dialog, Menu, globalShortcut } = require('electron');
const path = require('path');

let win = null;
let winP = null;
let winC = null;
let printers = [];

let listPrint = [];
let isPrinting = false;

const BASE_GESTOR="https://gestor.lecard.delivery/";
// const BASE_GESTOR="https://hhh.gestor.lecard.delivery/";
// const BASE_GESTOR="http://localhost:8080/";

protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }]);
app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');
app.setAppUserModelId('delivery.lecard.gestor');
Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  win = createBrowser('icon.png');
  win.loadFile("pages/loading.html");

  win.once('ready-to-show', () => {
    win.show();

    setTimeout(() => {
      win.loadURL(BASE_GESTOR).then(() => {}).catch(() => {
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
    height: 600,
    minWidth: 600,
    minHeight: 600,
    title: 'Gestor de Pedidos',
    backgroundColor: '#dc3545',
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
    callback({id_impressao, status: 4, erro: "Não foi possível encontrar a impressora selecionada"});
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
  });

  const version = app.getVersion();

  printers = win.webContents.getPrinters();
  const strPrinter = JSON.stringify(printers);

  win.webContents.executeJavaScript(`sessionStorage.setItem('Printers',${JSON.stringify(strPrinter)}); sessionStorage.setItem('ElectronV', '${version}')`).then(() => {
    if (isPackaged) {
      const { autoUpdater } = require('electron-updater');
      autoUpdater.checkForUpdates();
    }
  });
}

function printFila(event) {
  if (!isPrinting && listPrint.length) {
    isPrinting = true;

    printData(listPrint[0], (res) => {
      isPrinting = false;
      listPrint.splice(0,1);

      if (res && res.id_impressao) {
        event.reply('was-printed', res);
      }

      setTimeout(() => {
        printFila(event);
      }, 1500);
    });
  }
}
