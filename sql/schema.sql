CREATE DATABASE IF NOT EXISTS college_event_db;
USE college_event_db;

CREATE TABLE IF NOT EXISTS users_table (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  Username VARCHAR(100) UNIQUE NOT NULL,
  PASSWORD_HASH TEXT NOT NULL,
  Role ENUM('Admin', 'HelpDesk', 'FoodDesk') NOT NULL,
  prev_hash TEXT
);

CREATE TABLE IF NOT EXISTS events_table (
  Event_ID INT AUTO_INCREMENT PRIMARY KEY,
  Event_Name VARCHAR(100) UNIQUE NOT NULL,
  Block_Name VARCHAR(50),
  Block_Image VARCHAR(500),
  Floor_No INT,
  Class_No VARCHAR(20),
  deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS students_table (
  Student_ID INT AUTO_INCREMENT PRIMARY KEY,
  Name VARCHAR(150) NOT NULL,
  Contact VARCHAR(20),
  QR_String VARCHAR(255) UNIQUE,
  Event_Name VARCHAR(100),
  Team_Name VARCHAR(100),
  Team_Members TEXT,
  Lunch_Status ENUM('YES','NO') DEFAULT 'NO'
  ,CONSTRAINT fk_student_event_name
    FOREIGN KEY (Event_Name) REFERENCES events_table(Event_Name)
);

CREATE TABLE IF NOT EXISTS meal_desk_table (
  ID INT AUTO_INCREMENT PRIMARY KEY,
  Team_Name VARCHAR(100) UNIQUE,
  Morning_Snacks BOOLEAN DEFAULT FALSE,
  Lunch BOOLEAN DEFAULT FALSE,
  Evening_Snacks BOOLEAN DEFAULT FALSE,
  Final_Status BOOLEAN DEFAULT FALSE,
  required_morning_snacks BOOLEAN DEFAULT FALSE,
  required_lunch BOOLEAN DEFAULT FALSE,
  required_evening_snacks BOOLEAN DEFAULT FALSE
);
