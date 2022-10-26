module.exports = require("../db/base.js")({
    tableName: 'webhooks',
    tableStructure: {
        id: 'serial primary key',
        store_name: 'VARCHAR',
        order_id: 'bigint',
        type: 'VARCHAR',
        received_at: 'bigint',
        executed_at: 'bigint',
        payload: 'json'
    },
    insert: function(store_name, orderId, type, payload) {
        return module.exports.connection.one(`INSERT INTO ${module.exports.tableName} (store_name, order_id, type, received_at, payload) VALUES ($1, $2, $3, ${ Date.now()}, $4); SELECT * FROM ${module.exports.tableName} LIMIT 1; `, [store_name, orderId, type, payload]);
    }
});