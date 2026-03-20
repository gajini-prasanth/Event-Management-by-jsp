const pool = require("../config/db");

async function createStudent({ name, contact, qrString, eventName, teamName, teamMembers }) {
  const [result] = await pool.query(
    "INSERT INTO students_table (Name, Contact, QR_String, Event_Name, Team_Name, Team_Members, Lunch_Status) VALUES (?, ?, ?, ?, ?, ?, 'NO')",
    [name, contact || null, qrString, eventName, teamName || null, teamMembers || null]
  );
  return result.insertId;
}

async function findStudentByQr(qrString) {
  const [rows] = await pool.query(
    `SELECT s.*, e.Block_Name, e.Floor_No, e.Class_No
     FROM students_table s
     LEFT JOIN events_table e ON s.Event_Name = e.Event_Name
     WHERE s.QR_String = ? AND e.deleted_at IS NULL`,
    [qrString]
  );
  return rows[0] || null;
}

async function getTeamMembersByTeamName(teamName) {
  const [rows] = await pool.query(
    "SELECT Name, Team_Members FROM students_table WHERE Team_Name = ?",
    [teamName]
  );

  const members = new Set();
  for (const row of rows) {
    if (row.Name) {
      members.add(String(row.Name).trim());
    }

    if (row.Team_Members) {
      const parsed = String(row.Team_Members)
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean);

      for (const name of parsed) {
        members.add(name);
      }
    }
  }

  return Array.from(members);
}

module.exports = {
  createStudent,
  findStudentByQr,
  getTeamMembersByTeamName,
};
