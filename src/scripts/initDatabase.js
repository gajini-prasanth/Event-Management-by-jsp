require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

async function main() {
  const schemaPath = path.join(__dirname, "..", "..", "sql", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: true,
  });

  try {
    await connection.query(schemaSql);
    // eslint-disable-next-line no-console
    console.log("Database schema initialized successfully.");
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to initialize database schema:", error.message);
  process.exit(1);
});
