const {ipcRenderer} = require('electron');

const Config = require('electron-config');
const config = new Config();

const options = {
  content: '',
  copies: 1,
  zoom: 1
};

document.addEventListener("print", (e) => {
  const zoom = config.get('zoom');
  options.content = e.detail;
  options.zoom = zoom ? zoom : 1;
  ipcRenderer.send('print', options);
}, false);

window.LecardCom = true;
