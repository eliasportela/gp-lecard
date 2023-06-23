const {ipcRenderer} = require('electron');
const acbr = require('./acbr.js');

ipcRenderer.on('was-printed', (event, arg) => {
  document.dispatchEvent(new CustomEvent('wasPrinted', { detail: arg }));
});

document.addEventListener("print", (e) => {
  ipcRenderer.send('print', e.detail);
}, false);

document.addEventListener("gopage", (e) => {
  ipcRenderer.send('gopage', e.detail);
}, false);

document.addEventListener("comandoAcbr", (e) => {
  if (e.detail) {
    acbr.comandoACBR(e.detail);
  }
}, false);

window.Electron = true;
window.isReadOnly = true;
window.acbrFolder = null;
