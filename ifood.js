const FormData = require('form-data');
const fetch = require('electron-fetch').default;
let lecardKey = null;
let token = null;
let merchantId = null;
let base_url = null;
let count = 0;
let ifoodTimeout = null;
let listIfood = new Set();
let processIfood = false;

module.exports = {
  async pollingAPI(win, opt, base_api) {
    if (opt && opt.pause) {
      count = 0;
      win.webContents.send('ifoodReply', { error: "iFood pausado com sucesso!" });
      clearInterval(ifoodTimeout);
      return;
    }

    if (ifoodTimeout) {
      clearInterval(ifoodTimeout);
    }

    if (count === 0) {
      base_url = base_api;

      if (!opt || !opt.token || !opt.merchantId || !base_url) {
        win.webContents.send('ifoodReply', { error: "Token ou MerchantId do iFood não estão configurados!" });
        return;
      }

      lecardKey = opt.token || null;
      merchantId = opt.merchantId || null;
      await this.newSession();
    }

    if (!token) {
      win.webContents.send('ifoodReply', { error: "Não foi possível autenticar com o iFood!" });
      return;
    }

    await this.pollingIfood(win);

    ifoodTimeout = setInterval(async () => {
      await this.pollingIfood(win);
    }, 30 * 1000);
  },

  async pollingIfood(win) {
    count++;

    try {
      const res = await fetch('https://merchant-api.ifood.com.br/order/v1.0/events:polling',
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'x-polling-merchants': `${merchantId}` } });

      if (res.status === 401) {
        await this.newSession(true);
      }

      const orders = res.status === 200 ? await res.json() : [];
      const status = await this.getStatusMerchant();
      win.webContents.send('ifoodReply', { orders, status, count });

      if (res.status === 200) {
        await this.ifoodReplyOrder(orders);
      }

      return true;

    } catch (e) {
      let errorCode = e && e.code ? e.code : null;
      let error = errorCode ? (errorCode === 'ENOTFOUND' ? 'Verifique sua conexão com a internet.' : 'Código do erro: ' + errorCode) : e;
      win.webContents.send('ifoodReply', { error: "Não foi possível sincronizar os pedidos do iFood.\n" + error, errorCode });
      console.log(errorCode);
    }

    return false;
  },

  async newSession(renew) {
    try {
      const form = new FormData();
      form.append('key', lecardKey);

      if (renew) {
        form.append('renew', 'true');
      }

      const res = await fetch(base_url + 'api/integrador/ifood/auth',
        { method: 'POST', body: form });

      if (res.status === 200) {
        const json = await res.json();

        if (json.result) {
          token = json.token;
        }
      }

    } catch (err) {
      console.log(err);
    }
  },

  async getStatusMerchant() {
    if (count === 1) {
      return [];
    }

    try {
      const res = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}/status`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });

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

  async ifoodReplyOrder(data) {
    let orders = data || [];

    if (orders.length) {
      orders.forEach(evt => {
        listIfood.add(JSON.stringify(evt));
      });

      setTimeout(async () => {
        processIfood = false;
        await this.registerOrder();
      }, 1500);
    }
  },

  async registerOrder() {
    if (!processIfood && listIfood.size) {
      processIfood = true;
      const item = listIfood.values().next().value;

      await this.integradorIfood(JSON.parse(item), () => {
        listIfood.delete(item);

        setTimeout(async () => {
          processIfood = false;
          await this.registerOrder();
        }, 2000);
      });
    }
  },

  async integradorIfood(event, callback) {
    const form = this.getFormData(event);
    const res = await fetch(base_url + 'api/integrador/ifood',
      { method: 'POST', body: form });

    if (res.status === 200) {
      const json = await res.json();
      callback(json.success);

    } else {
      callback(false);
    }
  },

  getFormData(object) {
    const formData = new FormData();
    Object.keys(object).forEach(key => {
      if (typeof object[key] !== 'object') formData.append(key, object[key])
      else formData.append(key, JSON.stringify(object[key]))
    });

    return formData;
  }
};