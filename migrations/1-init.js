
// ./migrations/1-init.js
const createWebhooksTable = require("./db/helpers/create-main-table")
const insertWebhookData = require("./db/helpers/insert-webhook-data.js")

module.exports.generateSql = () => `${createWebhooksTable}`;