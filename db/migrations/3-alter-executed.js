
const alterExecuted = `ALTER TABLE Persons
ALTER COLUMN executed_at timestamp;`;
module.exports.generateSql = () => `${alterExecuted}`;