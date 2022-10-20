module.exports = require("../db/base.js")({
    tableName: 'webhooks',
    tableStructure: {
        id: 'serial primary key',
        order_id: 'bigint',
        type: 'VARCHAR',
        received_at: 'bigint',
        executed_at: 'bigint',
        payload: 'json'
    },
    insert: function(orderId, type, payload) {
        return module.exports.connection.none(`INSERT INTO ${module.exports.tableName} (order_id, type, received_at, payload) VALUES ($1, $2, ${Date.now()}, $3);`, [orderId, type, payload]);
    }
});