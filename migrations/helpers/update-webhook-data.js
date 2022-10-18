
module.exports = `
UPDATE webhooks
SET executed_at = $1
WHERE order_id = $2;`;
