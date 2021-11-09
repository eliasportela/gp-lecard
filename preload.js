const {ipcRenderer} = require('electron');

document.addEventListener("print", (e) => {
  ipcRenderer.send('print', e.detail);
}, false);

document.addEventListener("gopage", (e) => {
  ipcRenderer.send('gopage', e.detail);
}, false);

window.Electron = true;
window.LecardCom = true;
