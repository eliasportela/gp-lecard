const FormData = require('form-data');
const fetch = require('electron-fetch').default;
let lecardKey = null;
let token = null;
let merchantId = null;
let base_url = null;
let count = 0;

module.exports = {
  async pollingAPI(win, opt, base_api) {
    count++;

    if (count === 1) {
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

    try {
      const res = await fetch('https://merchant-api.ifood.com.br/order/v1.0/events:polling',
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'x-polling-merchants': `${merchantId}` } });

      if (res.status === 401) {
        await this.newSession(true);
      }

      const orders = res.status === 200 ? await res.json() : [];
      const status = await this.getStatusMerchant();
      win.webContents.send('ifoodReply', { orders, status });
      console.log(orders);

      return true;

    } catch (error) {
      console.log(error ? error.code : error);
      win.webContents.send('ifoodReply', { error: "Não foi possível sincronizar os pedidos do iFood!" });
    }

    return false;
  },

  async newSession(renew) {
    try {
      const form = new FormData();
      form.append('key', lecardKey || localStorage.getItem('key'));

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
  }
};