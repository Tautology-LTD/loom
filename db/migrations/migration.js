const migrate = import("postgres-migrations");

async function runMigration() {

  let dbConfig = {
    connectionString: process.env.DB_URL,
    ensureDatabaseExists: true,
    defaultDatabase: "postgres"
  };

  

    
  console.log(dbConfig);
  await migrate(dbConfig, ".")
}

runMigration();
