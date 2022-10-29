
const alterReceived = `ALTER TABLE webhooks
ALTER COLUMN received_at TYPE TIMESTAMP WITH TIME ZONE USING to_timestamp(received_at/1000);`;
module.exports.generateSql = () => `${alterReceived}`;  