-- JobReady SA Database Schema
-- MySQL Database Schema for Multilingual Job Readiness Platform

-- Drop existing tables if they exist (for development)
DROP TABLE IF EXISTS user_module_progress;
DROP TABLE IF EXISTS user_training;
DROP TABLE IF EXISTS training_modules;
DROP TABLE IF EXISTS training_courses;
DROP TABLE IF EXISTS cv_references;
DROP TABLE IF EXISTS cv_languages;
DROP TABLE IF EXISTS cv_skills;
DROP TABLE IF EXISTS cv_experience;
DROP TABLE IF EXISTS cv_education;
DROP TABLE IF EXISTS cvs;
DROP TABLE IF EXISTS job_applications;
DROP TABLE IF EXISTS saved_jobs;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    preferred_language ENUM('en', 'zu', 'st', 'tn') DEFAULT 'en',
    location VARCHAR(255),
    date_of_birth DATE,
    id_number VARCHAR(50),
    profile_picture_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_logo_url VARCHAR(500),
    location VARCHAR(255) NOT NULL,
    job_type ENUM('full-time', 'part-time', 'contract', 'temporary') NOT NULL,
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    description TEXT NOT NULL,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    source_language ENUM('en', 'zu', 'st', 'tn') DEFAULT 'en',
    posted_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    view_count INT DEFAULT 0,
    application_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_job_type (job_type),
    INDEX idx_posted_date (posted_date),
    INDEX idx_deadline (application_deadline),
    INDEX idx_active (is_active),
    FULLTEXT idx_search (title, company_name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAVED JOBS TABLE
-- ============================================
CREATE TABLE saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_job (user_id, job_id),
    INDEX idx_user (user_id),
    INDEX idx_job (job_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CVS TABLE
-- ============================================
CREATE TABLE cvs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    language ENUM('en', 'zu', 'st', 'tn') NOT NULL,
    template ENUM('modern', 'classic', 'creative') DEFAULT 'modern',
    personal_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_default BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_language (language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CV EDUCATION TABLE
-- ============================================
CREATE TABLE cv_education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_id INT NOT NULL,
    institution VARCHAR(255) NOT NULL,
    degree VARCHAR(255) NOT NULL,
    start_year INT NOT NULL,
    end_year INT,
    description TEXT,
    FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE,
    INDEX idx_cv (cv_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CV EXPERIENCE TABLE
-- ============================================
CREATE TABLE cv_experience (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_id INT NOT NULL,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE,
    INDEX idx_cv (cv_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CV SKILLS TABLE
-- ============================================
CREATE TABLE cv_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_id INT NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    proficiency_level ENUM('beginner', 'intermediate', 'advanced', 'expert'),
    FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE,
    INDEX idx_cv (cv_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CV LANGUAGES TABLE
-- ============================================
CREATE TABLE cv_languages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_id INT NOT NULL,
    language VARCHAR(100) NOT NULL,
    proficiency ENUM('basic', 'conversational', 'fluent', 'native') NOT NULL,
    FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE,
    INDEX idx_cv (cv_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CV REFERENCES TABLE
-- ============================================
CREATE TABLE cv_references (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    company VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    relationship VARCHAR(255),
    FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE,
    INDEX idx_cv (cv_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- JOB APPLICATIONS TABLE
-- ============================================
CREATE TABLE job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    cv_id INT NOT NULL,
    cover_letter TEXT,
    status ENUM('pending', 'reviewed', 'shortlisted', 'rejected', 'accepted') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (cv_id) REFERENCES cvs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_job_application (user_id, job_id),
    INDEX idx_job (job_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_applied_at (applied_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRAINING COURSES TABLE
-- ============================================
CREATE TABLE training_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    duration_hours DECIMAL(5, 2) NOT NULL,
    language ENUM('en', 'zu', 'st', 'tn') NOT NULL,
    thumbnail_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_language (language),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TRAINING MODULES TABLE
-- ============================================
CREATE TABLE training_modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    order_index INT NOT NULL,
    duration_minutes INT NOT NULL,
    video_url VARCHAR(500),
    FOREIGN KEY (course_id) REFERENCES training_courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_order (order_index)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER TRAINING TABLE (Enrollment & Progress)
-- ============================================
CREATE TABLE user_training (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP NULL,
    progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES training_courses(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_course (user_id, course_id),
    INDEX idx_user (user_id),
    INDEX idx_course (course_id),
    INDEX idx_completed (completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USER MODULE PROGRESS TABLE
-- ============================================
CREATE TABLE user_module_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    module_id INT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES training_modules(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_module (user_id, module_id),
    INDEX idx_user (user_id),
    INDEX idx_module (module_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA INSERTION
-- ============================================

-- Insert sample jobs
INSERT INTO jobs (title, company_name, location, job_type, salary_min, salary_max, description, requirements, posted_date, application_deadline) VALUES
('Retail Assistant', 'Pick n Pay Soweto', 'Soweto, Gauteng', 'full-time', 5000, 7000, 'Assisting customers with their shopping needs and maintaining store displays.', 'Grade 12, Customer service skills, Ability to work weekends', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
('Kitchen Assistant', 'Nando\'s Johannesburg', 'Diepkloof, Soweto', 'full-time', 4500, 6000, 'Assisting in food preparation and maintaining kitchen cleanliness.', 'Grade 10 minimum, Food handling certificate preferred', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 21 DAY)),
('Delivery Driver', 'Uber Eats', 'Johannesburg CBD', 'contract', 6000, 9000, 'Delivering food orders to customers using your own vehicle.', 'Valid driver\'s license, Own vehicle, Smartphone', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY)),
('Security Guard', 'SecureX Security', 'Sandton, Gauteng', 'full-time', 5500, 7500, 'Monitoring and protecting property and people.', 'PSIRA registered, Grade 12, Security training', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY)),
('Cashier', 'Shoprite', 'Soweto, Gauteng', 'part-time', 3500, 4500, 'Processing customer transactions and providing excellent service.', 'Grade 12, Basic math skills, Customer service experience', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 28 DAY));

-- Insert sample training courses
INSERT INTO training_courses (title, description, category, difficulty_level, duration_hours, language) VALUES
('Customer Service Excellence', 'Learn essential customer service skills to excel in any customer-facing role.', 'customer-service', 'beginner', 4.5, 'en'),
('Professional CV Writing', 'Master the art of creating compelling CVs that get you noticed by employers.', 'cv-writing', 'beginner', 3.0, 'en'),
('Interview Success Strategies', 'Learn proven techniques to ace your job interviews with confidence.', 'interview-skills', 'intermediate', 5.0, 'en'),
('Basic Computer Skills', 'Develop fundamental digital literacy skills for the modern workplace.', 'digital-literacy', 'beginner', 6.0, 'en');

-- Insert sample training modules
INSERT INTO training_modules (course_id, title, description, order_index, duration_minutes) VALUES
(1, 'Introduction to Customer Service', 'Understanding the importance of customer service', 1, 45),
(1, 'Communication Skills', 'Effective communication with customers', 2, 60),
(1, 'Handling Difficult Customers', 'Strategies for managing challenging situations', 3, 75),
(2, 'CV Structure and Format', 'Learn the essential components of a professional CV', 1, 45),
(2, 'Writing Compelling Content', 'Craft powerful descriptions of your experience', 2, 60),
(2, 'Tailoring Your CV', 'Customize your CV for different job applications', 3, 45);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Additional composite indexes for common queries
CREATE INDEX idx_jobs_location_type ON jobs(location, job_type, is_active);
CREATE INDEX idx_applications_user_status ON job_applications(user_id, status);
CREATE INDEX idx_training_user_progress ON user_training(user_id, completed, progress);

-- ============================================
-- VIEWS FOR COMMON QUERIES
-- ============================================

-- View for active jobs with application counts
CREATE VIEW v_active_jobs AS
SELECT 
    j.*,
    COUNT(DISTINCT ja.id) as total_applications,
    COUNT(DISTINCT sj.id) as total_saved
FROM jobs j
LEFT JOIN job_applications ja ON j.id = ja.job_id
LEFT JOIN saved_jobs sj ON j.id = sj.job_id
WHERE j.is_active = 1 AND j.application_deadline >= CURDATE()
GROUP BY j.id;

-- View for user course progress
CREATE VIEW v_user_course_progress AS
SELECT 
    ut.user_id,
    ut.course_id,
    tc.title as course_title,
    tc.category,
    ut.progress,
    ut.completed,
    ut.enrolled_at,
    ut.completed_at,
    COUNT(tm.id) as total_modules,
    COUNT(ump.id) as completed_modules
FROM user_training ut
JOIN training_courses tc ON ut.course_id = tc.id
LEFT JOIN training_modules tm ON tc.id = tm.course_id
LEFT JOIN user_module_progress ump ON tm.id = ump.module_id AND ump.user_id = ut.user_id AND ump.completed = 1
GROUP BY ut.id;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure to get user dashboard statistics
CREATE PROCEDURE sp_get_user_stats(IN p_user_id INT)
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM job_applications WHERE user_id = p_user_id) as total_applications,
        (SELECT COUNT(*) FROM saved_jobs WHERE user_id = p_user_id) as total_saved_jobs,
        (SELECT COUNT(*) FROM cvs WHERE user_id = p_user_id) as total_cvs,
        (SELECT COUNT(*) FROM user_training WHERE user_id = p_user_id AND completed = 1) as completed_courses,
        (SELECT AVG(progress) FROM user_training WHERE user_id = p_user_id) as avg_training_progress;
END //

-- Procedure to clean up expired job postings
CREATE PROCEDURE sp_cleanup_expired_jobs()
BEGIN
    UPDATE jobs 
    SET is_active = FALSE 
    WHERE application_deadline < CURDATE() 
    AND is_active = TRUE;
    
    SELECT ROW_COUNT() as jobs_deactivated;
END //

DELIMITER ;

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER //

-- Trigger to update job application count
CREATE TRIGGER trg_after_application_insert
AFTER INSERT ON job_applications
FOR EACH ROW
BEGIN
    UPDATE jobs 
    SET application_count = application_count + 1 
    WHERE id = NEW.job_id;
END //

-- Trigger to prevent multiple default CVs
CREATE TRIGGER trg_before_cv_default
BEFORE UPDATE ON cvs
FOR EACH ROW
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE cvs 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id AND id != NEW.id;
    END IF;
END //

DELIMITER ;
