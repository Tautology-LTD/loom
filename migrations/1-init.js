
// ./migrations/1-init.js
const createWebhooksTable = require("./create-main-table")
const insertWebhookData = require("./insert-webhook-data.js")

module.exports.generateSql = () => `${createWebhooksTable}
${insertWebhookData}`