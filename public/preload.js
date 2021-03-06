const {ipcRenderer} = require('electron');

const Config = require('electron-config');
const config = new Config();
const zoom = config.get('zoom');

const options = {
  content: '',
  copies: 1,
  zoom: zoom ? zoom : 1
};

document.addEventListener("print", (e) => {
  options.content = e.detail;
  // ipcRenderer.send('print', options);
  console.log(options)

}, false);

window.LecardCom = true;
