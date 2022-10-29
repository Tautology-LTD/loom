
const addStoreName = `ALTER TABLE webhooks
ADD COLUMN IF NOT EXISTS store_name VARCHAR; UPDATE webhooks 
SET store_name = LEFT(payload::json->>'order_status_url', position('.' in payload::json->>'order_status_url'));`;
module.exports.generateSql = () => `${addStoreName}`;