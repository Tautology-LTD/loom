
module.exports = `
INSERT INTO webhooks (order_id, type, received_at, payload)
VALUES ($1, $2, $3, $4);`;
