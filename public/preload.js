const {ipcRenderer} = require('electron');

document.addEventListener("print", (e) => {
  ipcRenderer.send('print', {
    content: e.detail,
    pdv: true
  });
}, false);

window.LecardCom = true;
