const { app, BrowserWindow, ipcMain, dialog, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

const env = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json'), 'utf8'));

let win = null;
let winP = null;
let winC = null;
let winLoad = null;

let loading = true;
const BASE_GESTOR = env.BASE_GESTOR;

app.userAgentFallback = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36';
app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');
app.setAppUserModelId('delivery.lecard.gestor');
Menu.setApplicationMenu(null);

app.whenReady().then(() => {
  winLoad = new BrowserWindow({
    width: 1100,
    height: 600,
    minWidth: 600,
    minHeight: 600,
    title: 'Gestor de Pedidos',
    backgroundColor: '#dc3545',
    show: true,
    icon: path.join(__dirname, 'icon.png')
  });

  winLoad.loadFile("pages/loading.html");

  winLoad.once('ready-to-show', () => {
    createWindow();
  });

  winLoad.on('closed', () => {
    if (loading) {
      app.quit();
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
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
    show: false,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#ffffff',
    icon: path.join(__dirname, icon)
  });
}

function createWindow () {
  win = createBrowser('icon.png');

  win.loadURL(BASE_GESTOR).then(() => {}).catch(() => {
    win.show();
    win.loadFile('pages/error.html');
  });

  win.on('closed', () => {
    app.quit();
  });

  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  win.once('ready-to-show', () => {
    winP = new BrowserWindow({
      width: 1000,
      show: false,
      title: 'Impressao'
    });

    winP.loadFile("pages/print.html");

    loadDendences();
  });
}

function printData(event, option) {
  if (!option) {
    return;
  }

  const ispdv = (typeof option === 'string');

  const impressora = option.impressora || {};
  const copies = option.copies ? option.copies : 1;
  const content = JSON.stringify(`${ispdv ? option : option.content}`);
  const zoom = impressora.zoom ? impressora.zoom : "9px";
  const width = impressora.largura ? impressora.largura : "100%";
  const deviceName = impressora.device ? impressora.device : "";

  const script = `
    document.getElementById('content').innerHTML = ${content};
    document.body.style.fontSize = '${zoom}';
    document.body.style.width = '${width}';
  `;

  const printer = { silent: !deviceName };

  try {
    winP.webContents.executeJavaScript(script).then(() => {

      try {
        winP.webContents.print(printer);

        if (printer.silent) {
          for (let i = 1; i < copies; i++) {
            setTimeout(() => {
              winP.webContents.print(printer);
            }, 1500);
          }
        }

      } catch (err) {
        dialogMsg("Não foi possível imprimir","Verifique se a impressora selecionada está disponível e tente novamente.")
      }

    }).catch(e => {
      console.log(e)
    });

  } catch (e) {
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
    printData(event, option);
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
    });

    winC.on('closed', () => {
      winC = null;
    });
  });

  // const printers = JSON.stringify(win.webContents.getPrinters());
  const version = app.getVersion();
  win.webContents.executeJavaScript(`window.Printers = []; sessionStorage.setItem('ElectronV', '${version}')`).then(() => {
    if (isPackaged) {
      const { autoUpdater } = require('electron-updater');
      autoUpdater.checkForUpdates();
    }
  });

  loading = false;
  winLoad.close();
  win.show();
}
