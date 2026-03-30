
CREATE DATABASE IF NOT EXISTS jobready_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jobready_db;

-- ── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  full_name        VARCHAR(255)        NOT NULL,
  phone            VARCHAR(20)         NOT NULL UNIQUE,
  email            VARCHAR(255)        UNIQUE,
  password_hash    VARCHAR(255)        NOT NULL,
  language         ENUM('en','zu','st','tn') NOT NULL DEFAULT 'en',
  location         VARCHAR(255),
  date_of_birth    DATE,
  id_number        VARCHAR(13),
  profile_complete INT                 DEFAULT 0,
  created_at       TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Jobs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS jobs (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  title                VARCHAR(255)    NOT NULL,
  company_name         VARCHAR(255)    NOT NULL,
  location             VARCHAR(255)    NOT NULL,
  job_type             ENUM('full-time','part-time','contract','temporary') NOT NULL DEFAULT 'full-time',
  salary_min           INT,
  salary_max           INT,
  description          TEXT,
  requirements         TEXT,
  emoji                VARCHAR(10)     DEFAULT '💼',
  is_active            TINYINT(1)      DEFAULT 1,
  application_deadline DATE,
  view_count           INT             DEFAULT 0,
  application_count    INT             DEFAULT 0,
  posted_date          TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  created_at           TIMESTAMP       DEFAULT CURRENT_TIMESTAMP
);

-- ── Job translations ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_translations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  job_id      INT          NOT NULL,
  language    ENUM('zu','st','tn') NOT NULL,
  title       VARCHAR(255),
  description TEXT,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_job_lang (job_id, language)
);

-- ── Job applications ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_applications (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  job_id       INT         NOT NULL,
  user_id      INT         NOT NULL,
  cv_id        INT,
  cover_letter TEXT,
  status       ENUM('pending','reviewed','shortlisted','rejected','accepted') DEFAULT 'pending',
  applied_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)  REFERENCES jobs(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_application (job_id, user_id)
);

-- ── Saved jobs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_jobs (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  job_id   INT       NOT NULL,
  user_id  INT       NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id)  REFERENCES jobs(id)  ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_saved (job_id, user_id)
);

-- ── CVs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cvs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT          NOT NULL,
  title      VARCHAR(255) NOT NULL DEFAULT 'My CV',
  language   ENUM('en','zu','st','tn') DEFAULT 'en',
  template   VARCHAR(50)  DEFAULT 'modern',
  cv_data    JSON,
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Training courses ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_courses (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  title_zu         VARCHAR(255),
  title_st         VARCHAR(255),
  title_tn         VARCHAR(255),
  description      TEXT,
  category         VARCHAR(100),
  difficulty_level ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  duration_hours   DECIMAL(4,1),
  language         VARCHAR(20)  DEFAULT 'en',
  emoji            VARCHAR(10)  DEFAULT '📚',
  bg_color         VARCHAR(20)  DEFAULT '#d4f5e2',
  is_active        TINYINT(1)   DEFAULT 1,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

-- ── User training progress ───────────────────────────────────
CREATE TABLE IF NOT EXISTS user_training (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT       NOT NULL,
  course_id   INT       NOT NULL,
  progress    INT       DEFAULT 0,
  completed   TINYINT(1) DEFAULT 0,
  enrolled_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP  DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)            ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES training_courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (user_id, course_id)
);

-- ── Translation cache ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS translation_cache (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  source_text_hash VARCHAR(64)  NOT NULL,
  source_language  VARCHAR(10)  NOT NULL,
  target_language  VARCHAR(10)  NOT NULL,
  translated_text  TEXT         NOT NULL,
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_translation (source_text_hash, source_language, target_language)
);