module.exports = function(mx) {
    mx.connection = require('./connection.js'),
    mx.all = function() {
        return mx.connection.none(`SELECT * FROM ${mx.tableName}`);
    };
    mx.limit = function(limit) {
        return mx.connection.manyOrNone(`SELECT * FROM ${mx.tableName} ORDER BY ID DESC LIMIT $1`, [limit]);
    };
    mx.createTable = function() {
        let tableStructure = mx.tableStructure;
        let tableStructurePairs = [];
        for (let fieldName in tableStructure) {
            tableStructurePairs.push(`${fieldName} ${tableStructure[fieldName]}`);
        }
        return mx.connection.none(`DROP TABLE IF EXISTS ${mx.tableName}; CREATE TABLE ${mx.tableName} (${tableStructurePairs.join(', ')})`);
    };
    mx.findBy = function(query) {
        let where_statement = query.map(function(value, field) {
            return field + ' ' + value;
        }).join(', ');
        mx.connection.oneOrNone(`SELECT * FROM ${mx.tableName} WHERE ${where_statement}`);
    };
    mx.where = function(query) {
        let where_statement = query.map(function(value, field) {
            return field + ' ' + value
        }).join(', ')
        mx.connection.manyOrNone(`SELECT * FROM ${mx.tableName} WHERE ${where_statement}`);
    };
    mx.update = function(update, query) {
        let update_statement = update.map(function(value, field) {
            return field + ' ' + value
        }).join(', ');
        let where_statement = query.map(function(value, field) {
            return field + ' ' + value
        }).join(', ');
        mx.connection.manyOrNone(`UPDATE ${mx.tableName} SET ${update_statement} WHERE ${where_statement}`);
    };
    return mx;
};