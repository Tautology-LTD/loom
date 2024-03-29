const pm = require("postgres-migrations");
 require('dotenv').config();

async function runMigration() {
let databaseURL = new URL(process.env.DB_URL);

  let dbConfig = {
    database: databaseURL.pathname.split("/").pop(),
    user: databaseURL.username,
    password: databaseURL.password,
    host: databaseURL.hostname,
    port: parseInt(databaseURL.port),
    ensureDatabaseExists: true,
    defaultDatabase: "postgres"
  };
  
     await pm.migrate(dbConfig, "./db/migrations");
}

runMigration();
