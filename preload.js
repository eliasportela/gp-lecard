const {ipcRenderer} = require('electron');
const fs = require("fs");
const store = require('./store.js')

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
    comandoACBR(e.detail);
  }
}, false);

window.Electron = true;
window.LecardCom = true;
window.isComanda = !!store.get("isComanda");
window.acbrFolder = null;

function comandoACBR(comando) {
  if (!window.acbrFolder) {
    document.dispatchEvent(new CustomEvent('acbrReply', { detail: "LeCard Monitor não configurado!" }));
    return;
  }

  const path = window.acbrFolder + '/';

  removerAcbrFile(path, () => {
    fs.writeFile(path + 'ent.txt', comando,null, function (err) {
      if (err) throw err;

      lerACBR(path, 1, (res) => {
        if (res) {
          document.dispatchEvent(new CustomEvent('acbrReply', { detail: res }));
        }
      });
    });
  });
}

function lerACBR(path, cont, callback) {
  if (fs.existsSync(path + 'sai.txt')) {
    fs.readFile(path + "sai.txt", 'utf-8', function (err, data) {
      if (err) throw err;
      callback(data);
      removerAcbrFile(path);
    });

  } else if (cont < 10) {
    setTimeout(() => {
      lerACBR(path, ++cont, callback);
    }, 1000);
  }
}

function removerAcbrFile(path, callback) {
  if (fs.existsSync(path + 'sai.txt')) {
    try {
      fs.unlinkSync(path + 'sai.txt');

      if (callback) {
        callback();
      }

    } catch(err) {
      console.error(err)
    }

  } else if (callback) {
    callback();
  }
}

// ifood
let ifoodTimeout = null;

ipcRenderer.on('ifoodReply', (event, arg) => {
  document.dispatchEvent(new CustomEvent('ifoodReply', { detail: arg }));
});

document.addEventListener('ifoodPolling', (e) => {
  if (e.detail.pause) {
    clearTimeout(ifoodTimeout);

  } else {
    pollingIfood(e.detail);
  }
});

function pollingIfood(detail) {
  if (ifoodTimeout) {
    clearTimeout(ifoodTimeout);
  }

  ipcRenderer.send('ifoodEvent', detail);
  ifoodTimeout = setTimeout(() => {
    pollingIfood();
  }, 1000 * 30);
}