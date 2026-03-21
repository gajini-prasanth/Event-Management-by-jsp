-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `college_event_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
USE `college_event_db`;

-- --------------------------------------------------------
-- Table structure for table `events_table`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `events_table` (
  `Event_ID`    int(11)      NOT NULL AUTO_INCREMENT,
  `Event_Name`  varchar(100) NOT NULL,
  `Block_Name`  varchar(50)  DEFAULT NULL,
  `Block_Image` varchar(500) DEFAULT NULL,
  `Floor_No`    int(11)      DEFAULT NULL,
  `Class_No`    varchar(20)  DEFAULT NULL,
  `deleted_at`  timestamp    NULL DEFAULT NULL,
  PRIMARY KEY (`Event_ID`),
  UNIQUE KEY `Event_Name` (`Event_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `meal_desk_table`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `meal_desk_table` (
  `ID`                       int(11)      NOT NULL AUTO_INCREMENT,
  `Team_Name`                varchar(100) DEFAULT NULL,
  `Morning_Snacks`           tinyint(1)   DEFAULT 0,
  `Lunch`                    tinyint(1)   DEFAULT 0,
  `Evening_Snacks`           tinyint(1)   DEFAULT 0,
  `Final_Status`             tinyint(1)   DEFAULT 0,
  `required_morning_snacks`  tinyint(1)   DEFAULT 0,
  `required_lunch`           tinyint(1)   DEFAULT 0,
  `required_evening_snacks`  tinyint(1)   DEFAULT 0,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Team_Name` (`Team_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `students_table`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `students_table` (
  `Student_ID`   int(11)              NOT NULL AUTO_INCREMENT,
  `Name`         varchar(150)         NOT NULL,
  `Contact`      varchar(20)          DEFAULT NULL,
  `QR_String`    varchar(255)         DEFAULT NULL,
  `Event_Name`   varchar(100)         DEFAULT NULL,
  `Team_Name`    varchar(100)         DEFAULT NULL,
  `Team_Members` text                 DEFAULT NULL,
  `Lunch_Status` enum('YES','NO')     DEFAULT 'NO',
  PRIMARY KEY (`Student_ID`),
  UNIQUE KEY `QR_String` (`QR_String`),
  KEY `fk_student_event_name` (`Event_Name`),
  CONSTRAINT `fk_student_event_name`
    FOREIGN KEY (`Event_Name`) REFERENCES `events_table` (`Event_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- Table structure for table `users_table`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users_table` (
  `ID`            int(11)                          NOT NULL AUTO_INCREMENT,
  `Username`      varchar(100)                     NOT NULL,
  `PASSWORD_HASH` text                             NOT NULL,
  `Role`          enum('Admin','HelpDesk','FoodDesk') NOT NULL,
  `prev_hash`     text                             DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
