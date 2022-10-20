function buildQueryString(params, logicalConjunction = 'AND') {
    let wherePairs = [];
    for (let column in params) {
        wherePairs.push(`${column}=${params[column]}`);
    }
    return wherePairs.join(` ${logicalConjunction} `)
}

module.exports = function(mx) {
    mx.connection = require('./connection.js'),
    mx.createTable = function() {
        let tableStructure = mx.tableStructure;
        let tableStructurePairs = [];
        for (let fieldName in tableStructure) {
            tableStructurePairs.push(`${fieldName} ${tableStructure[fieldName]}`);
        }
        return mx.connection.none(`DROP TABLE IF EXISTS ${mx.tableName}; CREATE TABLE ${mx.tableName} (${tableStructurePairs.join(', ')})`);
    };
    mx.select = function(queryFunction, query = null) {
        let selectStatement = `SELECT * FROM ${mx.tableName}`;
        if (query) {
            let queryString = buildQueryString(query);
            selectStatement = `${selectStatement} WHERE ${queryString}`
        }
        return queryFunction(selectStatement);
    };
    mx.all = function() {
        return mx.select(mx.connection.manyOrNone);
    };
    mx.find = function(id) {
        return mx.select(mx.connection.oneOrNone, {id: id});
    };
    mx.findBy = function(query) {
        return mx.select(mx.connection.oneOrNone, query);
    };
    mx.where = function(query) {
        return mx.select(mx.connection.manyOrNone, query);
    };

    mx.limit = function(limit) {
        return mx.connection.manyOrNone(`SELECT * FROM ${mx.tableName} ORDER BY ID DESC LIMIT $1`, [limit]);
    };

    mx.update = function(update, query) {
        let update_statement = update.map(function(value, field) {
            return field + ' ' + value
        }).join(', ');
        let where_statement = query.map(function(value, field) {
            return field + ' ' + value
        }).join(', ');
        return mx.connection.manyOrNone(`UPDATE ${mx.tableName} SET ${update_statement} WHERE ${where_statement}`);
    };

    return mx;
};