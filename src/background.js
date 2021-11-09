'use strict'
/* global __static */

import { app, protocol, BrowserWindow, ipcMain, globalShortcut, dialog, Menu } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production';
import { autoUpdater } from "electron-updater"
import * as Sentry from "@sentry/electron";

const Config = require('electron-config');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let winPrint;
let winAuto;
let winChat;
let contents;

Sentry.init({ dsn: "https://d0b9e4f31c3e48c59436bdc93ee8685d@o449432.ingest.sentry.io/5855240" });

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])
app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');
app.setAppUserModelId('delivery.lecard.gplecard');
Menu.setApplicationMenu(null);

if (!isDevelopment) {
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
  });
}

function createWindow () {
  win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    title: 'Gestor de Pedidos',
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true
    },
    icon: path.join(__static, 'icon.png')
  });

  win.once('focus', () => win.flashFrame(false));

  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  // impressao de pedidos
  winPrint = new BrowserWindow({
    width: 1000,
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  winPrint.loadURL(__static + "/print.html");

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    // if (!process.env.IS_TEST) win.webContents.openDevTools()

  } else {
    createProtocol('app');
    win.loadURL('app://./index.html');

    if (process.env.VUE_APP_DISABLE_UPDATE !== 'true') {
      checkUpdate()
    }
  }

  win.on('closed', () => {
    app.quit()
  });

  winPrint.on("closed", () => {
    winPrint = null;
  });

  contents = win.webContents;

  win.maximize();
  win.show();
}

app.on('web-contents-created', (e, contents) => {
  if (contents.getType() === 'webview') {
    contents.on('new-window', (e, url) => {
      e.preventDefault();
      require('electron').shell.openExternal(url)
    })
  }
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
});

app.on('ready', async () => {
  const config = new Config();

  if (!config.get('impressora')) {
    const zoom = config.get('zoom') ? config.get('zoom') : "";

    switch (zoom) {
      case "1":
        config.set('zoom', "7px");
        break;
      case "2":
        config.set('zoom', "9px");
        break;
      case "3":
        config.set('zoom', "11px");
        break;
      default:
        config.set('zoom', "9px");
        break;
    }

    config.set('impressora', {
      automatico: config.get("impressaoAutomatica") ? config.get("impressaoAutomatica") : "0",
      nCopias: config.get('nCopias') ? config.get('nCopias') : "1",
      zoom: config.get('zoom'),
      device: config.get('device') ? config.get('device') : "",
      devicePdv: config.get('devicePdv') ? config.get('devicePdv') : "",
      largura: config.get('largura') ? config.get('largura') : ""
    });

    config.delete('impressaoAutomatica');
    config.delete('nCopias');
    config.delete('zoom');
    config.delete('device');
    config.delete('devicePdv');
  }

  createWindow();
  globalShortcut.register('CommandOrControl+L', () => {
    win.webContents.openDevTools();
    // winPrint.webContents.openDevTools();
  })
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.on('relaunch-app', () => {
  app.quit();
});

ipcMain.on('reload', () => {
  win.reload();
  winPrint.webContents.send('printConfig');
});

ipcMain.on('focus', () => {
  if (win) {
    win.show()
  }
});

ipcMain.on('reloud-icon', (evt, option) => {
  if (option) {
    win.setOverlayIcon(path.join(__static, 'one.png'), 'Novo pedido');
    win.flashFrame(true)
  } else {
    win.setOverlayIcon(null, '');
  }
});

ipcMain.on('getPrinters', (event, arg) => {
  event.reply('getPrinters', contents.getPrinters());
});

ipcMain.on('print', (event, option) => {
  printData(event, option, winPrint);
});

ipcMain.on('readyToPrint', (event, data) => {
  try {
    winPrint.webContents.print({
      silent: true,
      deviceName: data ? data : ''
    });
  } catch (err) {
    dialogMsg("Não foi possível imprimir este documento!","Verifique se a impressora selecionada está disponível e tente novamente.")
  }
});

ipcMain.on('autoatendimento', () => {
  if (winAuto) {
    winAuto.show();
    return;
  }

  winAuto = new BrowserWindow({
    width: 1000,
    height: 600,
    icon: path.join(__static, 'icon.png')
  });
  winAuto.setMenu(null);
  winAuto.loadURL('http://totem.lecard.delivery/');

  winAuto.on('closed', () => {
    winAuto = null;
  })
});

function printData(event, option, wind) {
  const copies = option.copies ? option.copies : 1;
  wind.webContents.send('print', option);

  for (let i = 1; i < copies; i++) {
    setTimeout(() => {
      wind.webContents.send('print', option);
    }, 2000)
  }

  event.sender.send('print-return', 'success');
}

function checkUpdate() {
  autoUpdater.checkForUpdates();

  autoUpdater.on('update-downloaded', (info) => {
    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 4000);
  })
}

function dialogMsg(title, message) {
  dialog.showMessageBox(win, {
    type: 'info',
    buttons: ['OK'],
    title,
    message
  }, null);
}

ipcMain.on('openChat', () => {
  if (winChat) {
    winChat.show();
    return;
  }

  winChat = new BrowserWindow({
    width: 525,
    height: 700,
    minWidth: 525,
    minHeight: 700,
    icon: path.join(__static, 'icon.png'),
    title: 'LeCard - Ajuda'
  });

  winChat.setMenu(null);
  winChat.loadURL('https://tawk.to/chat/5ea3225a35bcbb0c9ab45dca/default');

  winChat.on('closed', () => {
    winChat = null;
  });
});
