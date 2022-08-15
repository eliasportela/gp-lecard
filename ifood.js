const fetch = require('electron-fetch').default;
const FormData = require('form-data');
let lecardKey = null;
let token = null;
let merchantId = null;
let count = 0;

module.exports = {
  async pollingAPI(win, opt) {
    if (count === 0) {
      if (!opt.token || !opt.merchantId) {
        return;
      }

      lecardKey = opt.token || null;
      merchantId = opt.merchantId || null;
      await this.newSession();
    }

    if (!token || !merchantId) {
      return;
    }

    count++;

    try {
      const res = await fetch('https://merchant-api.ifood.com.br/order/v1.0/events:polling',
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'x-polling-merchants': `${merchantId}` } });

      console.log(count);

      if (res.status === 401) {
        await this.newSession(true);
      }

      const orders = res.status === 200 ? await res.json() : [];
      const status = await this.getStatusMerchant();
      win.webContents.send('ifoodReply', { orders, status });

      return true;

    } catch (error) {
      console.log(error ? error.code : error);
    }

    return false;
  },

  async newSession(renew) {
    try {
      const form = new FormData()
      form.append('key', lecardKey || localStorage.getItem('key'));

      if (renew) {
        form.append('renew', 'true');
      }

      const res = await fetch('http://localhost/lecard-server/api/integrador/ifood/auth',
        { method: 'POST', body: form });
      const json = await res.json();
      if (json.result) {
        token = json.token;
      }

    } catch (err) {
      console.log(err);
    }
  },

  async getStatusMerchant() {
    try {
      const res = await fetch(`https://merchant-api.ifood.com.br/merchant/v1.0/merchants/${merchantId}/status`,
        { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });

      const json = await res.json();
      if (json) {
        return json;
      }

      return [];

    } catch (err) {
      console.log(err);
      return [];
    }
  }
};