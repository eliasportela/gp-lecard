const FormData = require('form-data');
const fetch = require('electron-fetch').default;
let base_url = null;
let count = 0;
let ifoodTimeout = null;
let listIfood = new Set();
let processIfood = false;
let empresas = [];

module.exports = {
  async pollingAPI(win, opt) {
    if (opt && opt.pause) {
      count = 0;
      win.webContents.send('ifoodReply', { error: "iFood pausado com sucesso!" });
      clearInterval(ifoodTimeout);
      return;
    }

    if (ifoodTimeout) {
      clearInterval(ifoodTimeout);
    }

    base_url = opt.base_api || "https://api.storkdigital.com.br/";

    if (!opt || !opt.token || !opt.merchantId || !base_url) {
      win.webContents.send('ifoodReply', { error: "Token ou MerchantId do iFood não estão configurados!" });
      return;
    }

    if (!empresas.find(e => e.id_empresa === opt.id_empresa)) {
      opt.key = opt.token;
      const token = await this.newSession(opt, false);

      if (!token) {
        win.webContents.send('ifoodReply', { error: "Não foi possível autenticar com o iFood! Faça o login novamente no Portal para continuar." });

      } else {
        const empresa = { token, merchantId: opt.merchantId, key: opt.token, id_empresa: opt.id_empresa }
        empresas.push(empresa);
        await this.pollingIfood(win, empresa);
      }
    }

    ifoodTimeout = setInterval(async () => {
      count++;

      for (const e of empresas) {
        if (!e.token) {
          win.webContents.send('ifoodReply', { error: "Não foi possível autenticar com o iFood! Faça o login novamente no Portal para continuar." });
          return;
        }

        await this.pollingIfood(win, e);
      }
    }, 30 * 1000);
  },

  async pollingIfood(win, empresa) {
    try {
      const res = await fetch('https://merchant-api.ifood.com.br/order/v1.0/events:polling',
        { method: 'GET', headers: { 'Authorization': `Bearer ${empresa.token}`, 'x-polling-merchants': `${empresa.merchantId}` } });

      if (res.status === 401) {
        empresa.token = await this.newSession(empresa, true);

        if (!empresa.token) {
          win.webContents.send('ifoodReply', { error: "Não foi possível autenticar com o iFood! Faça o login novamente no Portal para continuar." });
          empresas = empresas.filter(e => e !== empresa);
          return;
        }
      }

      const orders = res.status === 200 ? await res.json() : [];
      const status = await this.getStatusMerchant(empresa);
      win.webContents.send('ifoodReply', { merchantId: empresa.merchantId, orders, status, count });

      if (res.status === 200) {
        await this.ifoodReplyOrder(orders, win);
      }

      return true;

    } catch (e) {
      let errorCode = e && e.code ? e.code : null;
      let error = errorCode ? (['ERR_INTERNET_DISCONNECTED', 'ENOTFOUND'].includes(errorCode) ? 'Verifique sua conexão com a internet.' : 'Código do erro: ' + errorCode) : e;
      win.webContents.send('ifoodReply', { error: "Não foi possível sincronizar os pedidos do iFood.\n" + error, errorCode });
      console.log(errorCode);
    }

    return false;
  },

  async newSession(empresa, renew) {
    try {
      const form = new FormData();
      form.append('key', empresa.key);
      form.append('id_empresa', empresa.id_empresa || '');

      if (renew) {
        form.append('renew', 'true');
      }

      const res = await fetch(base_url + 'api/integrador/ifood/auth',
        { method: 'POST', body: form });

      if (res.status === 200) {
        const json = await res.json();

        if (json.result) {
          return json.token;
        }
      }

      return null;

    } catch (err) {
      console.log(err);
      return null;
    }
  },

  async getStatusMerchant(empresa) {
    if (count === 0) {
      return [];
    }

    try {
      const res = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${empresa.merchantId}/status`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${empresa.token}` } });

      if (res.status === 200) {
        const json = await res.json();

        if (json) {
          return json;
        }
      }

      return [];

    } catch (err) {
      console.log(err);
      return [];
    }
  },

  async ifoodReplyOrder(data, win) {
    let orders = data || [];

    if (orders.length) {
      orders.forEach(evt => {
        listIfood.add(JSON.stringify(evt));
      });

      setTimeout(async () => {
        await this.registerOrder(win);
      }, 1500);
    }
  },

  async registerOrder(win) {
    if (!processIfood && listIfood.size) {
      processIfood = true;
      const item = listIfood.values().next().value;

      await this.integradorIfood(item, (res, msg) => {
        listIfood.delete(item);

        setTimeout(async () => {
          processIfood = false;
          await this.registerOrder(win);
        }, 2000);

        if (!res && msg) {
          console.log(msg)
          win.webContents.send('ifoodReply', { error: "Erro ao enviar o evento para o servidor. " + msg });
        }
      });

    } else if (!listIfood.size) {
      processIfood = false;
    }
  },

  async integradorIfood(object, callback) {
    const form = new FormData();
    form.append('json_data', object);
    const res = await fetch(base_url + 'api/integrador/ifood',
      { method: 'POST', body: form });

    const text = await res.text();

    try {
      const json = JSON.parse(text);

      if (res.status === 200) {
        callback(true);

      } else {
        callback(false, json);
      }

    } catch (e) {
      callback(false, text);
    }
  }
};