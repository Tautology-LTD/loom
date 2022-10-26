
const alterReceived = `ALTER TABLE Persons
ALTER COLUMN received_at timestamp;`;
module.exports.generateSql = () => `${alterReceived}`;