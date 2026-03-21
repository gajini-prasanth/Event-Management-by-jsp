-- ============================================================
-- College Event Management System – SQL Query Reference
-- Database: college_event_db
-- ============================================================


-- ============================================================
-- SECTION 1: DATABASE & SCHEMA SETUP
-- ============================================================

CREATE DATABASE IF NOT EXISTS college_event_db;
USE college_event_db;

-- Users table (Admin, HelpDesk, FoodDesk) with bcrypt hash-chain
CREATE TABLE IF NOT EXISTS users_table (
  ID            INT AUTO_INCREMENT PRIMARY KEY,
  Username      VARCHAR(100) UNIQUE NOT NULL,
  PASSWORD_HASH TEXT NOT NULL,
  Role          ENUM('Admin', 'HelpDesk', 'FoodDesk') NOT NULL,
  prev_hash     TEXT
);

-- Events table with soft-delete support
CREATE TABLE IF NOT EXISTS events_table (
  Event_ID    INT AUTO_INCREMENT PRIMARY KEY,
  Event_Name  VARCHAR(100) UNIQUE NOT NULL,
  Block_Name  VARCHAR(50),
  Block_Image VARCHAR(500),
  Floor_No    INT,
  Class_No    VARCHAR(20),
  deleted_at  TIMESTAMP NULL DEFAULT NULL
);

-- Students registered for events (holds QR string, team info, lunch status)
CREATE TABLE IF NOT EXISTS students_table (
  Student_ID  INT AUTO_INCREMENT PRIMARY KEY,
  Name        VARCHAR(150) NOT NULL,
  Contact     VARCHAR(20),
  QR_String   VARCHAR(255) UNIQUE,
  Event_Name  VARCHAR(100),
  Team_Name   VARCHAR(100),
  Team_Members TEXT,
  Lunch_Status ENUM('YES','NO') DEFAULT 'NO',
  CONSTRAINT fk_student_event_name
    FOREIGN KEY (Event_Name) REFERENCES events_table(Event_Name)
);

-- Meal-desk tracking per team (morning snacks, lunch, evening snacks)
CREATE TABLE IF NOT EXISTS meal_desk_table (
  ID                       INT AUTO_INCREMENT PRIMARY KEY,
  Team_Name                VARCHAR(100) UNIQUE,
  Morning_Snacks           BOOLEAN DEFAULT FALSE,
  Lunch                    BOOLEAN DEFAULT FALSE,
  Evening_Snacks           BOOLEAN DEFAULT FALSE,
  Final_Status             BOOLEAN DEFAULT FALSE,
  required_morning_snacks  BOOLEAN DEFAULT FALSE,
  required_lunch           BOOLEAN DEFAULT FALSE,
  required_evening_snacks  BOOLEAN DEFAULT FALSE
);

-- All columns (Block_Image, Team_Name, Team_Members) are defined in the
-- CREATE TABLE statements above.  The ALTER TABLE migration guards below are
-- kept only for reference when upgrading a very old installation that was
-- created before these columns were added to the schema.
--
-- ALTER TABLE events_table
--   ADD COLUMN IF NOT EXISTS Block_Image VARCHAR(500) NULL AFTER Block_Name;
--
-- ALTER TABLE students_table
--   ADD COLUMN IF NOT EXISTS Team_Name    VARCHAR(100) NULL AFTER Event_Name,
--   ADD COLUMN IF NOT EXISTS Team_Members TEXT        NULL AFTER Team_Name;


-- ============================================================
-- SECTION 2: SAMPLE / SEED DATA
-- ============================================================

-- Seed events (matches production data)
INSERT INTO `events_table` (`Event_Name`, `Block_Name`, `Block_Image`, `Floor_No`, `Class_No`)
VALUES
  ('CODE BYTE',      NULL, 'https://esecmap.my.canva.site/', NULL, NULL),
  ('QUANTA',         NULL, 'https://esecmap.my.canva.site/', NULL, NULL),
  ('AI-VERSE',       NULL, 'https://esecmap.my.canva.site/', NULL, NULL),
  ('CONSOLE CRAFT',  NULL, 'https://esecmap.my.canva.site/', NULL, NULL),
  ('SPIDER VAULT',   NULL, 'https://esecmap.my.canva.site/', NULL, NULL)
ON DUPLICATE KEY UPDATE
  Block_Name  = VALUES(Block_Name),
  Block_Image = VALUES(Block_Image),
  Floor_No    = VALUES(Floor_No),
  Class_No    = VALUES(Class_No),
  deleted_at  = NULL;

-- Seed meal configurations per team (matches production data)
INSERT INTO `meal_desk_table`
  (`Team_Name`, `Morning_Snacks`, `Lunch`, `Evening_Snacks`, `Final_Status`,
   `required_morning_snacks`, `required_lunch`, `required_evening_snacks`)
VALUES
  ('SPARK', 0, 0, 0, 0, 1, 1, 1)
ON DUPLICATE KEY UPDATE
  required_morning_snacks = VALUES(required_morning_snacks),
  required_lunch          = VALUES(required_lunch),
  required_evening_snacks = VALUES(required_evening_snacks);

-- Seed sample students (matches production data)
INSERT INTO `students_table`
  (`Name`, `Contact`, `QR_String`, `Event_Name`, `Team_Name`, `Team_Members`, `Lunch_Status`)
VALUES
  ('GAJINI PRASANTH G', '8344458720',
   'GAJINI PRASANTH G|8344458720|CODE BYTE|SPARK|1773998707809|3bc42723-5d62-454e-b70f-30ea64b109ed',
   'CODE BYTE', 'SPARK', 'Mohan', 'NO')
ON DUPLICATE KEY UPDATE
  Name       = VALUES(Name),
  Contact    = VALUES(Contact),
  Event_Name = VALUES(Event_Name),
  Team_Name  = VALUES(Team_Name),
  Team_Members = VALUES(Team_Members);

-- NOTE: User (admin / helpdesk / fooddesk) passwords are bcrypt hash-chained
-- and must be seeded via the Node.js scripts:
--   npm run seed:admin       --> creates the admin user
--   npm run seed:sample      --> creates helpdesk & fooddesk sample users


-- ============================================================
-- SECTION 3: USER QUERIES
-- ============================================================

-- Find a user by username (used during login)
SELECT * FROM users_table WHERE Username = 'admin' LIMIT 1;

-- Get the most recently created user (used for hash-chain seeding)
SELECT ID, PASSWORD_HASH FROM users_table ORDER BY ID DESC LIMIT 1;

-- List all users
SELECT ID, Username, Role FROM users_table ORDER BY ID ASC;

-- Insert a new user (passwordHash and prevHash are generated by Node.js)
INSERT INTO users_table (Username, PASSWORD_HASH, Role, prev_hash)
VALUES ('helpdesk', '<bcrypt_hash>', 'HelpDesk', '<prev_bcrypt_hash>');


-- ============================================================
-- SECTION 4: EVENT QUERIES
-- ============================================================

-- List all active (non-deleted) events
SELECT * FROM events_table WHERE deleted_at IS NULL ORDER BY Event_Name ASC;

-- Get a single event by ID
SELECT * FROM events_table WHERE Event_ID = 1 AND deleted_at IS NULL;

-- Create a new event
INSERT INTO events_table (Event_Name, Block_Name, Block_Image, Floor_No, Class_No)
VALUES ('New Event', 'D', 'https://example.com/image.jpg', 1, 'D-101');

-- Update event details (admin only)
UPDATE events_table
SET Block_Name  = 'E',
    Block_Image = 'https://example.com/new-image.jpg',
    Floor_No    = 2,
    Class_No    = 'E-205'
WHERE Event_ID = 1 AND deleted_at IS NULL;

-- Soft-delete an event (preserves data, hides from listings)
UPDATE events_table SET deleted_at = NOW() WHERE Event_ID = 1;

-- Restore a soft-deleted event
UPDATE events_table SET deleted_at = NULL WHERE Event_ID = 1;

-- Count active events
SELECT COUNT(*) AS active_event_count FROM events_table WHERE deleted_at IS NULL;


-- ============================================================
-- SECTION 5: STUDENT QUERIES
-- ============================================================

-- Register a new student (QR string is generated by Node.js)
INSERT INTO students_table (Name, Contact, QR_String, Event_Name, Team_Name, Team_Members, Lunch_Status)
VALUES ('Jane Doe', '9000000001', 'QR-HACK-999-JANE', 'Hackathon 2026', 'Team Delta', 'Alice, Bob', 'NO');

-- Look up a student by QR string (used by helpdesk scanner)
SELECT s.*, e.Block_Name, e.Floor_No, e.Class_No
FROM students_table s
LEFT JOIN events_table e ON s.Event_Name = e.Event_Name
WHERE s.QR_String = 'QR-HACK-001-AARAV' AND e.deleted_at IS NULL;

-- Get all members of a team (used to build meal-desk team roster)
SELECT Name, Team_Members FROM students_table WHERE Team_Name = 'Team Alpha';

-- Update lunch status for a student
UPDATE students_table SET Lunch_Status = 'YES' WHERE Student_ID = 1;

-- List all students (admin report view)
SELECT s.Student_ID, s.Name, s.Contact, s.Event_Name, s.Team_Name,
       s.Lunch_Status, e.Block_Name, e.Floor_No, e.Class_No
FROM students_table s
LEFT JOIN events_table e ON s.Event_Name = e.Event_Name
ORDER BY s.Event_Name ASC, s.Name ASC;

-- List students for a specific event
SELECT Student_ID, Name, Contact, Team_Name, Lunch_Status
FROM students_table
WHERE Event_Name = 'Hackathon 2026'
ORDER BY Name ASC;

-- Count students per event (admin dashboard summary)
SELECT Event_Name, COUNT(*) AS student_count
FROM students_table
GROUP BY Event_Name
ORDER BY Event_Name ASC;

-- Count total registered students
SELECT COUNT(*) AS total_students FROM students_table;


-- ============================================================
-- SECTION 6: MEAL DESK QUERIES
-- ============================================================

-- List all meal rows (food-desk dashboard)
SELECT * FROM meal_desk_table ORDER BY Team_Name ASC;

-- Get a single meal record by ID
SELECT * FROM meal_desk_table WHERE ID = 1 LIMIT 1;

-- Create a meal config for a new team (admin sets which meals are required)
INSERT INTO meal_desk_table
  (Team_Name, Morning_Snacks, Lunch, Evening_Snacks, Final_Status,
   required_morning_snacks, required_lunch, required_evening_snacks)
VALUES ('Team Delta', FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, FALSE)
ON DUPLICATE KEY UPDATE
  required_morning_snacks = VALUES(required_morning_snacks),
  required_lunch          = VALUES(required_lunch),
  required_evening_snacks = VALUES(required_evening_snacks);

-- Auto-create a meal row when a student team is first seen (all meals required by default)
INSERT IGNORE INTO meal_desk_table
  (Team_Name, Morning_Snacks, Lunch, Evening_Snacks, Final_Status,
   required_morning_snacks, required_lunch, required_evening_snacks)
VALUES ('Team Delta', FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, TRUE);

-- Update which meals a team is required to receive (admin).
-- NOTE: Changing Team_Name here will cause students_table rows that still
-- reference the old name in the Team_Name column to become mismatched.
-- students_table.Team_Name is a plain VARCHAR with no foreign-key constraint
-- to meal_desk_table, so the database will not prevent the rename.  Only
-- rename a team when the corresponding students_table.Team_Name values have
-- also been updated (or when no students are yet linked to this team).
UPDATE meal_desk_table
SET Team_Name               = 'Team Delta',
    required_morning_snacks = TRUE,
    required_lunch          = TRUE,
    required_evening_snacks = FALSE
WHERE ID = 1;

-- Mark meals as served (food-desk updates)
UPDATE meal_desk_table
SET Morning_Snacks = TRUE,
    Lunch          = TRUE,
    Evening_Snacks = FALSE,
    Final_Status   = FALSE  -- set to TRUE once all required meals are served
WHERE ID = 1;

-- Mark all required meals as served and close out a team
UPDATE meal_desk_table
SET Morning_Snacks = TRUE,
    Lunch          = TRUE,
    Evening_Snacks = TRUE,
    Final_Status   = TRUE
WHERE ID = 1;

-- Delete a meal config row (admin)
DELETE FROM meal_desk_table WHERE ID = 1;

-- Count teams that have completed all their meals
SELECT COUNT(*) AS completed_teams FROM meal_desk_table WHERE Final_Status = TRUE;

-- Summary: meals served vs required per team
SELECT
  Team_Name,
  required_morning_snacks,  Morning_Snacks,
  required_lunch,           Lunch,
  required_evening_snacks,  Evening_Snacks,
  Final_Status
FROM meal_desk_table
ORDER BY Team_Name ASC;


-- ============================================================
-- SECTION 7: ANALYTICAL / REPORTING QUERIES
-- ============================================================

-- Overall registration count per event
SELECT e.Event_Name, e.Block_Name, e.Floor_No, e.Class_No,
       COUNT(s.Student_ID) AS registered_students
FROM events_table e
LEFT JOIN students_table s ON e.Event_Name = s.Event_Name
WHERE e.deleted_at IS NULL
GROUP BY e.Event_ID, e.Event_Name, e.Block_Name, e.Floor_No, e.Class_No
ORDER BY registered_students DESC;

-- Students who have had lunch
SELECT Name, Contact, Event_Name, Team_Name
FROM students_table
WHERE Lunch_Status = 'YES'
ORDER BY Event_Name ASC, Name ASC;

-- Teams with pending meal completion
SELECT m.Team_Name, m.Final_Status,
       m.required_morning_snacks, m.Morning_Snacks,
       m.required_lunch,          m.Lunch,
       m.required_evening_snacks, m.Evening_Snacks
FROM meal_desk_table m
WHERE m.Final_Status = FALSE
ORDER BY m.Team_Name ASC;

-- Full roster: student details joined with meal status for their team
SELECT s.Name, s.Contact, s.Event_Name, s.Team_Name, s.Lunch_Status,
       m.Morning_Snacks, m.Lunch AS Team_Lunch, m.Evening_Snacks, m.Final_Status
FROM students_table s
LEFT JOIN meal_desk_table m ON s.Team_Name = m.Team_Name
ORDER BY s.Event_Name ASC, s.Team_Name ASC, s.Name ASC;

-- Dashboard summary counts
SELECT
  (SELECT COUNT(*) FROM events_table  WHERE deleted_at IS NULL) AS active_events,
  (SELECT COUNT(*) FROM students_table)                          AS total_students,
  (SELECT COUNT(*) FROM meal_desk_table)                         AS total_teams,
  (SELECT COUNT(*) FROM meal_desk_table WHERE Final_Status = TRUE) AS teams_meal_done,
  (SELECT COUNT(*) FROM users_table)                             AS total_users;
