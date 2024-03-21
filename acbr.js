const fs = require("fs");

module.exports = {
  comandoACBR(comando) {
    if (!window.acbrFolder) {
      document.dispatchEvent(new CustomEvent('acbrReply', { detail: "LeCard Monitor não configurado!" }));

      // setTimeout(() => {
      //   document.dispatchEvent(new CustomEvent('acbrReply', { detail: 'OK: 0,300' }));
      // }, 1200);

      return;
    }

    const path = window.acbrFolder + '/';

    this.removerAcbrFile(path, () => {
      fs.writeFile(path + 'ent.txt', comando, null, (err) => {
        if (err) throw err;

        this.lerACBR(path, 1, (res) => {
          if (res) {
            document.dispatchEvent(new CustomEvent('acbrReply', { detail: res }));
          }
        });
      });
    });
  },

  lerACBR(path, cont, callback) {
    if (fs.existsSync(path + 'sai.txt')) {
      fs.readFile(path + "sai.txt", 'utf-8', (err, data) => {
        if (err) throw err;
        callback(data);
        this.removerAcbrFile(path);
      });

    } else if (cont < 10) {
      setTimeout(() => {
        this.lerACBR(path, ++cont, callback);
      }, 1000);
    }
  },

  removerAcbrFile(path, callback) {
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
};