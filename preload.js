const {ipcRenderer} = require('electron');
const elStore = require("electron-store");
const fs = require("fs");
let store = new elStore();

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
  // const comando = e.detail;
  comandoACBR('BAL.LePeso');
}, false);

window.Electron = true;
window.LecardCom = true;
window.isComanda = !!store.get("isComanda");

function comandoACBR(comando) {
  fs.writeFile('C://ACBrMonitorPLUS/ent.txt', comando,null, function (err) {
    if (err) throw err;

    lerACBR(1, (res) => {
      if (res) {
        document.dispatchEvent(new CustomEvent('acbrReply', { detail: res }));
      }
    });
  });
}

function lerACBR(cont, callback) {
  console.log('lendo.. ' + cont)

  if (fs.existsSync('C://ACBrMonitorPLUS/sai.txt')) {
    fs.readFile("C://ACBrMonitorPLUS/sai.txt", 'utf-8', function (err, data) {
      if(err) throw err;
      callback(data);

      try {
        fs.unlinkSync('C://ACBrMonitorPLUS/sai.txt')

      } catch(err) {
        console.error(err)
      }
    });

  } else if (cont < 10) {
    setTimeout(() => {
      lerACBR(++cont, callback);
    }, 1000);
  }
}