require("dotenv").config();

const pool = require("../config/db");
const { createChainedHash } = require("../middleware/hashChain");
const { getLastUser, findUserByUsername, createUser } = require("../models/userModel");

async function seedEvents() {
  const events = [
    { name: "Hackathon 2026", block: "A", floor: 2, classNo: "A-204" },
    { name: "Paper Presentation", block: "C", floor: 1, classNo: "C-103" },
    { name: "Robo Race", block: "B", floor: 3, classNo: "B-309" },
  ];

  for (const event of events) {
    await pool.query(
      `INSERT INTO events_table (Event_Name, Block_Name, Floor_No, Class_No)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         Block_Name = VALUES(Block_Name),
         Floor_No = VALUES(Floor_No),
         Class_No = VALUES(Class_No),
         deleted_at = NULL`,
      [event.name, event.block, event.floor, event.classNo]
    );
  }
}

async function seedMealConfigs() {
  const teams = [
    { name: "Team Alpha", reqMorning: true, reqLunch: true, reqEvening: false },
    { name: "Team Beta", reqMorning: false, reqLunch: true, reqEvening: true },
    { name: "Team Gamma", reqMorning: true, reqLunch: false, reqEvening: true },
  ];

  for (const team of teams) {
    await pool.query(
      `INSERT INTO meal_desk_table
         (Team_Name, Morning_Snacks, Lunch, Evening_Snacks, Final_Status, required_morning_snacks, required_lunch, required_evening_snacks)
       VALUES (?, FALSE, FALSE, FALSE, FALSE, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         required_morning_snacks = VALUES(required_morning_snacks),
         required_lunch = VALUES(required_lunch),
         required_evening_snacks = VALUES(required_evening_snacks)`,
      [team.name, team.reqMorning, team.reqLunch, team.reqEvening]
    );
  }
}

async function seedStudents() {
  const students = [
    {
      name: "Aarav Kumar",
      contact: "9876543210",
      qr: "QR-HACK-001-AARAV",
      event: "Hackathon 2026",
      team: "Team Alpha",
    },
    {
      name: "Diya Nair",
      contact: "9876501234",
      qr: "QR-PAPER-002-DIYA",
      event: "Paper Presentation",
      team: "Team Beta",
    },
    {
      name: "Rohan Iyer",
      contact: "9876005678",
      qr: "QR-ROBO-003-ROHAN",
      event: "Robo Race",
      team: "Team Gamma",
    },
  ];

  for (const student of students) {
    await pool.query(
      `INSERT INTO students_table (Name, Contact, QR_String, Event_Name, Team_Name, Lunch_Status)
       VALUES (?, ?, ?, ?, ?, 'NO')
       ON DUPLICATE KEY UPDATE
         Name = VALUES(Name),
         Contact = VALUES(Contact),
         Event_Name = VALUES(Event_Name),
         Team_Name = VALUES(Team_Name)`,
      [student.name, student.contact, student.qr, student.event, student.team]
    );
  }
}

async function createChainedUserIfMissing(username, role, plainPassword) {
  const existing = await findUserByUsername(username);
  if (existing) {
    return false;
  }

  const lastUser = await getLastUser();
  const previousHash = lastUser ? lastUser.PASSWORD_HASH : null;
  const { passwordHash, prevHash } = await createChainedHash(plainPassword, previousHash);

  await createUser({
    username,
    role,
    passwordHash,
    prevHash,
  });

  return true;
}

async function seedRoleUsers() {
  const createdHelpDesk = await createChainedUserIfMissing("helpdesk", "HelpDesk", "Help@12345");
  const createdFoodDesk = await createChainedUserIfMissing("fooddesk", "FoodDesk", "Food@12345");

  return { createdHelpDesk, createdFoodDesk };
}

async function main() {
  await seedEvents();
  await seedMealConfigs();
  await seedStudents();
  const userResult = await seedRoleUsers();

  const [[eventCountRow]] = await pool.query("SELECT COUNT(*) AS count FROM events_table WHERE deleted_at IS NULL");
  const [[mealCountRow]] = await pool.query("SELECT COUNT(*) AS count FROM meal_desk_table");
  const [[studentCountRow]] = await pool.query("SELECT COUNT(*) AS count FROM students_table");

  // eslint-disable-next-line no-console
  console.log("Sample data seeded successfully.");
  // eslint-disable-next-line no-console
  console.log(`Active events: ${eventCountRow.count}`);
  // eslint-disable-next-line no-console
  console.log(`Meal teams: ${mealCountRow.count}`);
  // eslint-disable-next-line no-console
  console.log(`Students: ${studentCountRow.count}`);
  // eslint-disable-next-line no-console
  console.log(
    `Created users -> helpdesk: ${userResult.createdHelpDesk ? "yes" : "already exists"}, fooddesk: ${userResult.createdFoodDesk ? "yes" : "already exists"}`
  );
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Failed to seed sample data:", error.message);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
