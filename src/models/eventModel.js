const pool = require("../config/db");

async function listActiveEvents() {
  const [rows] = await pool.query(
    "SELECT * FROM events_table WHERE deleted_at IS NULL ORDER BY Event_Name ASC"
  );
  return rows;
}

async function createEvent({ eventName, blockName, blockImage, floorNo, classNo }) {
  await pool.query(
    "INSERT INTO events_table (Event_Name, Block_Name, Block_Image, Floor_No, Class_No) VALUES (?, ?, ?, ?, ?)",
    [eventName, blockName || null, blockImage || null, floorNo || null, classNo || null]
  );
}

async function updateEvent(eventId, { blockName, blockImage, floorNo, classNo }) {
  await pool.query(
    "UPDATE events_table SET Block_Name = ?, Block_Image = ?, Floor_No = ?, Class_No = ? WHERE Event_ID = ? AND deleted_at IS NULL",
    [blockName || null, blockImage || null, floorNo || null, classNo || null, eventId]
  );
}

async function softDeleteEvent(eventId) {
  await pool.query(
    "UPDATE events_table SET deleted_at = NOW() WHERE Event_ID = ?",
    [eventId]
  );
}

module.exports = {
  listActiveEvents,
  createEvent,
  updateEvent,
  softDeleteEvent,
};
