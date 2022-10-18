// Proper way to initialize and share the Database object

const e = require('express');

// Loading and initializing the library:
const pgp = require('pg-promise')({
    // Initialization Options
});
let ssl = null;
if (process.env.NODE_ENV === 'development') {
    ssl = {rejectUnauthorized: false};
 }else{
    ssl = {rejectUnauthorized: true};
 }
// Preparing the connection details:
const cn = {
    connectionString: process.env.DATABASE_URL,
    ssl: ssl
};

// Creating a new database instance from the connection details:
const db = pgp(cn);

// Exporting the database object for shared use:
module.exports = db;
