const {ipcRenderer} = require('electron');

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

window.Electron = true;
window.LecardCom = true;
