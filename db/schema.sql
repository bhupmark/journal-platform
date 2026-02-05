-- Journal Platform - MySQL Schema
-- Run this after creating database: mysql -u root -p journal_db < db/schema.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  affiliation VARCHAR(255),
  country VARCHAR(100),
  role ENUM('admin', 'editor', 'reviewer', 'author', 'reader') NOT NULL DEFAULT 'author',
  profile_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  body TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issues table
CREATE TABLE IF NOT EXISTS issues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year INT NOT NULL,
  volume INT NOT NULL,
  issue_number INT NOT NULL,
  title VARCHAR(500),
  published_at DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_issue (year, volume, issue_number)
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue_id INT,
  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  doi VARCHAR(255),
  pdf_path VARCHAR(500),
  citation_apa TEXT,
  citation_ieee TEXT,
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (issue_id) REFERENCES issues(id)
);

-- Article Authors table
CREATE TABLE IF NOT EXISTS article_authors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  article_id INT NOT NULL,
  user_id INT,
  full_name VARCHAR(255) NOT NULL,
  affiliation VARCHAR(255),
  display_order INT DEFAULT 0,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  author_id INT NOT NULL,
  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  manuscript_path VARCHAR(500),
  status ENUM('submitted', 'under_review', 'revision_requested', 'accepted', 'rejected', 'published') DEFAULT 'submitted',
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Submission Revisions table
CREATE TABLE IF NOT EXISTS submission_revisions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT,
  reviewer_id INT,
  recommendation VARCHAR(50),
  comment_author TEXT,
  comment_editor TEXT,
  submitted_at TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions(id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- Editorial Board table
CREATE TABLE IF NOT EXISTS editorial_board (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  role VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for common queries
CREATE INDEX idx_submissions_author ON submissions(author_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_articles_issue ON articles(issue_id);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned);
