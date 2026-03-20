const pool = require("../config/db");

async function listMealRows() {
  const [rows] = await pool.query(
    "SELECT * FROM meal_desk_table ORDER BY Team_Name ASC"
  );
  return rows;
}

async function createMealConfig({ teamName, reqMorning, reqLunch, reqEvening }) {
  await pool.query(
    `INSERT INTO meal_desk_table
      (Team_Name, Morning_Snacks, Lunch, Evening_Snacks, Final_Status, required_morning_snacks, required_lunch, required_evening_snacks)
     VALUES (?, FALSE, FALSE, FALSE, FALSE, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       required_morning_snacks = VALUES(required_morning_snacks),
       required_lunch = VALUES(required_lunch),
       required_evening_snacks = VALUES(required_evening_snacks)`,
    [teamName, !!reqMorning, !!reqLunch, !!reqEvening]
  );
}

async function ensureMealTeamExists(teamName) {
  await pool.query(
    `INSERT IGNORE INTO meal_desk_table
      (Team_Name, Morning_Snacks, Lunch, Evening_Snacks, Final_Status, required_morning_snacks, required_lunch, required_evening_snacks)
     VALUES (?, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, TRUE)`,
    [teamName]
  );
}

async function updateMealConfig(id, { teamName, reqMorning, reqLunch, reqEvening }) {
  await pool.query(
    `UPDATE meal_desk_table
     SET Team_Name = ?, required_morning_snacks = ?, required_lunch = ?, required_evening_snacks = ?
     WHERE ID = ?`,
    [teamName, !!reqMorning, !!reqLunch, !!reqEvening, id]
  );
}

async function deleteMealConfig(id) {
  await pool.query("DELETE FROM meal_desk_table WHERE ID = ?", [id]);
}

async function updateFoodDeskStatus(id, { morning, lunch, evening }) {
  const [rows] = await pool.query(
    "SELECT * FROM meal_desk_table WHERE ID = ? LIMIT 1",
    [id]
  );
  const row = rows[0];

  if (!row) {
    throw new Error("Meal record not found");
  }

  if (morning && !row.required_morning_snacks) {
    throw new Error("Morning snacks is not enabled by admin for this team");
  }
  if (lunch && !row.required_lunch) {
    throw new Error("Lunch is not enabled by admin for this team");
  }
  if (evening && !row.required_evening_snacks) {
    throw new Error("Evening snacks is not enabled by admin for this team");
  }

  const finalStatus =
    (!row.required_morning_snacks || morning) &&
    (!row.required_lunch || lunch) &&
    (!row.required_evening_snacks || evening);

  await pool.query(
    `UPDATE meal_desk_table
     SET Morning_Snacks = ?, Lunch = ?, Evening_Snacks = ?, Final_Status = ?
     WHERE ID = ?`,
    [!!morning, !!lunch, !!evening, finalStatus, id]
  );
}

module.exports = {
  listMealRows,
  createMealConfig,
  ensureMealTeamExists,
  updateMealConfig,
  deleteMealConfig,
  updateFoodDeskStatus,
};
