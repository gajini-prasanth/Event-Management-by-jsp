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

    const [blockImageColumns] = await connection.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'events_table'
         AND COLUMN_NAME = 'Block_Image'`,
      [process.env.DB_NAME || "college_event_db"]
    );

    if (blockImageColumns.length === 0) {
      await connection.query("ALTER TABLE events_table ADD COLUMN Block_Image VARCHAR(500) NULL AFTER Block_Name");
    }

    const [teamNameColumns] = await connection.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'students_table'
         AND COLUMN_NAME = 'Team_Name'`,
      [process.env.DB_NAME || "college_event_db"]
    );

    if (teamNameColumns.length === 0) {
      await connection.query("ALTER TABLE students_table ADD COLUMN Team_Name VARCHAR(100) NULL AFTER Event_Name");
    }

    const [teamMembersColumns] = await connection.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = ?
         AND TABLE_NAME = 'students_table'
         AND COLUMN_NAME = 'Team_Members'`,
      [process.env.DB_NAME || "college_event_db"]
    );

    if (teamMembersColumns.length === 0) {
      await connection.query("ALTER TABLE students_table ADD COLUMN Team_Members TEXT NULL AFTER Team_Name");
    }

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
