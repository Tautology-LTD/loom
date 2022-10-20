const apiHelper = require('./api.js');

module.exports = {
    getStoreWebhooks: function (store) {
        return apiHelper.getRequest(store, "webhooks.json");
    }
}