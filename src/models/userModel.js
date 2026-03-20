const pool = require("../config/db");

async function getLastUser() {
  const [rows] = await pool.query(
    "SELECT ID, PASSWORD_HASH FROM users_table ORDER BY ID DESC LIMIT 1"
  );
  return rows[0] || null;
}

async function findUserByUsername(username) {
  const [rows] = await pool.query(
    "SELECT * FROM users_table WHERE Username = ? LIMIT 1",
    [username]
  );
  return rows[0] || null;
}

async function createUser({ username, role, passwordHash, prevHash }) {
  const [result] = await pool.query(
    "INSERT INTO users_table (Username, PASSWORD_HASH, Role, prev_hash) VALUES (?, ?, ?, ?)",
    [username, passwordHash, role, prevHash]
  );
  return result.insertId;
}

module.exports = {
  getLastUser,
  findUserByUsername,
  createUser,
};
