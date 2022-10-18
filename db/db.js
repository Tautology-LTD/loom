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
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    ssl: ssl
};

// Creating a new database instance from the connection details:
const db = pgp(cn);

// Exporting the database object for shared use:
module.exports = db;
