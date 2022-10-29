
const alterExecuted = `ALTER TABLE webhooks
ALTER COLUMN executed_at TYPE TIMESTAMP WITH TIME ZONE USING to_timestamp(executed_at/1000);`;
module.exports.generateSql = () => `${alterExecuted}`;