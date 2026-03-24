CREATE DATABASE IF NOT EXISTS sportconnect_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE sportconnect_db;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- =========================================
-- USERS
-- =========================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) DEFAULT NULL,
  email VARCHAR(320) UNIQUE,
  profile_photo TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================
-- SPORT LOCATIONS
-- =========================================
CREATE TABLE sport_locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sport ENUM('futebol','basquete','volei') NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10,8) DEFAULT NULL,
  longitude DECIMAL(11,8) DEFAULT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  description TEXT DEFAULT NULL,
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================
-- TEAMS
-- =========================================
CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sport ENUM('futebol','basquete','volei') NOT NULL,
  description TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  logo_url TEXT DEFAULT NULL,
  founded_year INT DEFAULT NULL,
  created_by INT NOT NULL,
  is_recruiting TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_teams_user
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- TEAM MEMBERS
-- =========================================
CREATE TABLE team_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  position VARCHAR(100) DEFAULT NULL,
  role ENUM('jogador','tecnico','capitao') DEFAULT 'jogador',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_team_user (team_id, user_id),

  CONSTRAINT fk_team_members_team
    FOREIGN KEY (team_id)
    REFERENCES teams(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_team_members_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- PLAYER PROFILES (1:1)
-- =========================================
CREATE TABLE player_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  position VARCHAR(100) DEFAULT NULL,
  sport ENUM('futebol','basquete','volei') NOT NULL,
  years_of_experience INT DEFAULT NULL,
  objective ENUM('profissional','amador') DEFAULT 'amador',
  specialty TEXT DEFAULT NULL,
  age INT DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_player_profile_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- GAMES
-- =========================================
CREATE TABLE games (
  id INT AUTO_INCREMENT PRIMARY KEY,
  created_by INT NOT NULL,
  sport ENUM('futebol','basquete','volei') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  location_id INT DEFAULT NULL,
  custom_location TEXT DEFAULT NULL,
  game_date DATETIME NOT NULL,
  max_players INT DEFAULT NULL,
  skill_level ENUM('iniciante','intermediario','avancado') DEFAULT 'intermediario',
  status ENUM('aberto','cheio','cancelado','finalizado') DEFAULT 'aberto',
  image_url TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_games_user
    FOREIGN KEY (created_by)
    REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_games_location
    FOREIGN KEY (location_id)
    REFERENCES sport_locations(id)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================
-- GAME PARTICIPANTS
-- =========================================
CREATE TABLE game_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  game_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_game_user (game_id, user_id),

  CONSTRAINT fk_game_participants_game
    FOREIGN KEY (game_id)
    REFERENCES games(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_game_participants_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- ANNOUNCEMENTS
-- =========================================
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type ENUM('procurando_time','procurando_jogador','procurando_treinador') NOT NULL,
  sport ENUM('futebol','basquete','volei') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  position VARCHAR(100) DEFAULT NULL,
  skill_level ENUM('iniciante','intermediario','avancado') DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_announcements_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================
-- NEWS
-- =========================================
CREATE TABLE news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT DEFAULT NULL,
  content TEXT DEFAULT NULL,
  sport ENUM('futebol','basquete','volei','geral') DEFAULT 'geral',
  image_url TEXT DEFAULT NULL,
  source_url TEXT DEFAULT NULL,
  source VARCHAR(100) DEFAULT NULL,
  published_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

COMMIT;