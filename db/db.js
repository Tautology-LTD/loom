// Proper way to initialize and share the Database object

const e = require('express');

// Loading and initializing the library:
const pgp = require('pg-promise')({
    // Initialization Options
});

let useSsl = false;
if (process.env.NODE_ENV === 'development') {
    connectionString = process.env.HEROKU_POSTGRESQL_IVORY_URL;
 } else {
    connectionString = process.env.HEROKU_POSTGRESQL_IVORY_URL;
    useSsl = true;
 }

// Creating a new database instance from the connection details:
const db = pgp({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: useSsl
    }
});

// Exporting the database object for shared use:
module.exports = db;
