'use strict'
/* global __static */

import { app, protocol, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import {
  createProtocol,
  /* installVueDevtools */
} from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let winPrint;
let winComanda;
let contents;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{scheme: 'app', privileges: { secure: true, standard: true } }])
app.commandLine.appendSwitch('--autoplay-policy','no-user-gesture-required');

function setAppUserModelId() {
  console.log(process.execPath);
  var updateDotExe = path.join(path.dirname(process.execPath), '..', 'update.exe');

  var packageDir = path.dirname(path.resolve(updateDotExe));
  var packageName = path.basename(packageDir);
  var exeName = path.basename(process.execPath).replace(/\.exe$/i, '');

  global.appUserModelId = `com.squirrel.${exeName}`;
  console.log(global.appUserModelId)
  app.setAppUserModelId(global.appUserModelId);
}

// setAppUserModelId();

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {nodeIntegration: true},
    icon: path.join(__static, 'icon.png')
  });
  win.setMenu(null);

  win.once('focus', () => win.flashFrame(false));

   win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  // impressao de pedidos
  winPrint = new BrowserWindow({
    width: 1000,
    webPreferences: {nodeIntegration: true}
  });
  winPrint.hide();
  winPrint.loadURL(__static + "/print.html");

  // impressao de comandas
  winComanda = new BrowserWindow({
    width: 1000,
    webPreferences: {nodeIntegration: true}
  });
  winComanda.hide();
  winComanda.loadURL(__static + "/venda.html");
  // winPrint.webContents.openDevTools();

  if (process.env.WEBPACK_DEV_SERVER_URL) {

    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools()

  } else {
    createProtocol('app');
    win.loadURL('app://./index.html');
  }

  win.on('closed', () => {
    app.quit()
  });

  winPrint.on("closed", () => {
    winPrint = null;
  });

  winComanda.on("closed", () => {
    winComanda = null;
  });

  contents = win.webContents;
}

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
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    // try {
    //   await installVueDevtools()
    // } catch (e) {
    //   console.error('Vue Devtools failed to install:', e.toString())
    // }

  }
  createWindow()

  globalShortcut.register('CommandOrControl+L', () => {
    win.webContents.openDevTools()
  })
})

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

ipcMain.on('reloud', () => {
  win.reload();
});

ipcMain.on('reloud-icon', (evt, option) => {
  console.log(option)
  if (option) {
    win.setOverlayIcon(path.join(__static, 'one.png'), 'Novo pedido');
    win.flashFrame(true)
  } else {
    win.setOverlayIcon(null, '');
  }
});

/// impresao
let copies = 1;

ipcMain.on('print-list', (event, arg) => {
  event.sender.send('print-list', contents.getPrinters());
});

ipcMain.on('print', (event, option) => {
  printData(event, option, winPrint);
});

ipcMain.on('readyToPrint', (event) => {
  winPrint.webContents.print({silent: true});
});

ipcMain.on('printVenda', (event, option) => {
  printData(event, option, winComanda);
});

ipcMain.on('readyToPrintVenda', (event) => {
  winComanda.webContents.print({silent: true});
});

function printData(event, option, wind) {
  copies = option.copies ? option.copies : 1;
  wind.webContents.send('print', option.content);
  for (let i = 1; i < copies; i++) {
    setTimeout(() => {
      wind.webContents.send('print', option.content);
    }, 2000)
  }

  event.sender.send('print-return', 'success');
}
