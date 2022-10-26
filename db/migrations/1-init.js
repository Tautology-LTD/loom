
const webhookQueryHelper = require("../db/webhooks");

let tableStructure = webhookQueryHelper.tableStructure;
let tableStructurePairs = [];
for (let fieldName in tableStructure) {
    tableStructurePairs.push(`${fieldName} ${tableStructure[fieldName]}`);
}
createWebhooksTable = `DROP TABLE IF EXISTS ${webhookQueryHelper.tableName}; CREATE TABLE ${webhookQueryHelper.tableName} (${tableStructurePairs.join(', ')})`;

 console.log(createWebhooksTable);
 
module.exports.generateSql = () => `${createWebhooksTable}`;