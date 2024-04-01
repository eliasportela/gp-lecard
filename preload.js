const {ipcRenderer} = require('electron');
const acbr = require('./acbr.js')
const os = require('node:os')

ipcRenderer.on('was-printed', (event, arg) => {
  document.dispatchEvent(new CustomEvent('wasPrinted', { detail: arg }));
});

document.addEventListener("print", (e) => {
  ipcRenderer.send('print', e.detail);
}, false);

document.addEventListener("gopage", (e) => {
  ipcRenderer.send('gopage', e.detail);
}, false);

document.addEventListener("goPageExternal", (e) => {
  ipcRenderer.send('goPageExternal', e.detail);
}, false);

document.addEventListener("comandoAcbr", (e) => {
  if (e.detail) {
    acbr.comandoACBR(e.detail);
  }
}, false);

window.Electron = true;
window.acbrFolder = null;
window.gPConfigs = { host: os.hostname() };

document.addEventListener("playNotification", () => {
  ipcRenderer.send('notification', true);
}, false);

document.addEventListener("pauseNotification", () => {
  ipcRenderer.send('notification', false);
}, false);

// ifood
document.addEventListener('ifoodPolling', (e) => {
  const opt = e.detail;
  ipcRenderer.send('ifoodEvent', opt);
});

ipcRenderer.on('ifoodReply', (event, arg) => {
  document.dispatchEvent(new CustomEvent('ifoodReply', { detail: arg }));
});

document.addEventListener("update", (e) => {
  ipcRenderer.send('update', e.detail || {});
}, false);