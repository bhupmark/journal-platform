-- Journal Platform - PostgreSQL Schema
-- Run this after creating database: psql -d journal_db -f db/schema.sql

-- User roles: admin, editor, reviewer, author, reader
CREATE TYPE user_role AS ENUM ('admin', 'editor', 'reviewer', 'author', 'reader');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  affiliation VARCHAR(255),
  country VARCHAR(100),
  role user_role NOT NULL DEFAULT 'author',
  profile_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  body TEXT,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE issues (
  id SERIAL PRIMARY KEY,
  year INT NOT NULL,
  volume INT NOT NULL,
  issue_number INT NOT NULL,
  title VARCHAR(500),
  published_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(year, volume, issue_number)
);

CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  issue_id INT REFERENCES issues(id),
  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  doi VARCHAR(255),
  pdf_path VARCHAR(500),
  citation_apa TEXT,
  citation_ieee TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE article_authors (
  id SERIAL PRIMARY KEY,
  article_id INT REFERENCES articles(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id),
  full_name VARCHAR(255) NOT NULL,
  affiliation VARCHAR(255),
  display_order INT DEFAULT 0
);

CREATE TYPE submission_status AS ENUM (
  'submitted', 'under_review', 'revision_requested',
  'accepted', 'rejected', 'published'
);

CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  author_id INT REFERENCES users(id) NOT NULL,
  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  manuscript_path VARCHAR(500),
  status submission_status DEFAULT 'submitted',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE submission_revisions (
  id SERIAL PRIMARY KEY,
  submission_id INT REFERENCES submissions(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  note TEXT
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  submission_id INT REFERENCES submissions(id),
  reviewer_id INT REFERENCES users(id),
  recommendation VARCHAR(50),
  comment_author TEXT,
  comment_editor TEXT,
  submitted_at TIMESTAMPTZ
);

CREATE TABLE editorial_board (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  role VARCHAR(100) NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Indexes for common queries
CREATE INDEX idx_submissions_author ON submissions(author_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_articles_issue ON articles(issue_id);
CREATE INDEX idx_announcements_pinned ON announcements(is_pinned);
