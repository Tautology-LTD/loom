module.exports = `
DROP TABLE IF EXISTS webhooks;
CREATE TABLE webhooks (
    id serial primary key,
    order_id bigint,
    type VARCHAR,
    received_at bigint,
    executed_at bigint,
    payload json

);`;
