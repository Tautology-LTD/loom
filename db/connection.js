// Proper way to initialize and share the Database object

const e = require('express');

// Loading and initializing the library:
const pgp = require('pg-promise')({
    // Initialization Options
});

let dbConfig = {};

let useSsl = false;
if (process.env.NODE_ENV === 'development') {
    dbConfig.connectionString = process.env.DB_URL;
    
 } else {
    dbConfig.connectionString = process.env.HEROKU_POSTGRESQL_IVORY_URL;
    dbConfig.rejectUnauthorized = useSsl;
 }

// Creating a new database instance from the connection details:
const db = pgp(dbConfig);

// Exporting the database object for shared use:
module.exports = db;
