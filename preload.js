const {ipcRenderer} = require('electron');
const store = require('./store.js')
const acbr = require('./acbr.js')

ipcRenderer.on('was-printed', (event, arg) => {
  document.dispatchEvent(new CustomEvent('wasPrinted', { detail: arg }));
});

document.addEventListener("print", (e) => {
  ipcRenderer.send('print', e.detail);
}, false);

document.addEventListener("gopage", (e) => {
  ipcRenderer.send('gopage', e.detail);
}, false);

document.addEventListener("playNotification", () => {
  ipcRenderer.send('notification', true);
}, false);

document.addEventListener("pauseNotification", () => {
  ipcRenderer.send('notification', false);
}, false);

document.addEventListener("comandoAcbr", (e) => {
  if (e.detail) {
    acbr.comandoACBR(e.detail);
  }
}, false);

window.Electron = true;
window.isComanda = !!store.get("isComanda");
window.acbrFolder = null;

// ifood
document.addEventListener('ifoodPolling', (e) => {
  const opt = e.detail;
  ipcRenderer.send('ifoodEvent', opt);
});

ipcRenderer.on('ifoodReply', (event, arg) => {
  document.dispatchEvent(new CustomEvent('ifoodReply', { detail: arg }));
});