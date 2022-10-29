
const webhookQueryHelper = require("../webhooks");
require('dotenv').config();

let tableStructure = webhookQueryHelper.tableStructure;
let tableStructurePairs = [];
for (let fieldName in tableStructure) {
    tableStructurePairs.push(`${fieldName} ${tableStructure[fieldName]}`);
}
let createWebhooksTable = `CREATE TABLE ${webhookQueryHelper.tableName} (${tableStructurePairs.join(', ')});`;

 
module.exports.generateSql = () => `${createWebhooksTable}`;