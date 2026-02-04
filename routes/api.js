const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

const getDb = () => {
  try { return require('../db/client'); } catch { return null; }
};

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) return res.status(401).json({ message: 'Login required' });
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.session || !req.session.user) return res.status(401).json({ message: 'Login required' });
  if (!roles.includes(req.session.user.role)) return res.status(403).json({ message: 'Insufficient role' });
  next();
};

// Public: announcements
router.get('/announcements', (req, res) => {
  const db = getDb();
  if (!db) return res.json({ data: [] });
  // TODO: query announcements
  res.json({ data: [] });
});

// Public: current issue / issues list
router.get('/issues', (req, res) => {
  const db = getDb();
  if (!db) return res.json({ data: [] });
  res.json({ data: [] });
});

router.get('/issues/:id/articles', (req, res) => {
  const db = getDb();
  if (!db) return res.json({ data: [] });
  res.json({ data: [] });
});

// Author: submit paper
router.post('/submissions', requireAuth, requireRole('author', 'admin'), upload.single('manuscript'), (req, res) => {
  const db = getDb();
  if (!db) return res.status(503).json({ message: 'Database not configured.' });
  const { title, abstract } = req.body || {};
  const file = req.file;
  if (!title) return res.status(400).json({ message: 'Title required' });
  // TODO: insert submission, link file path
  res.status(201).json({ id: 1, status: 'submitted', message: 'Submission received.' });
});

// Author: my submissions
router.get('/submissions', requireAuth, (req, res) => {
  const db = getDb();
  if (!db) return res.json({ data: [] });
  res.json({ data: [] });
});

// Author: upload revision
router.post('/submissions/:id/revisions', requireAuth, upload.single('file'), (req, res) => {
  res.status(201).json({ success: true });
});

// Reviewer: get assigned papers (submissions to review)
router.get('/reviewer/assignments', requireAuth, requireRole('reviewer', 'editor', 'admin'), (req, res) => {
  const db = getDb();
  if (!db) {
    // Mock data for testing without DB
    return res.json({ 
      data: [
        { id: 1, title: 'Machine Learning Advances', authors: 'Smith et al.', abstract: 'A paper on ML...', status: 'under_review', submitted_at: '2025-01-15' },
        { id: 2, title: 'Cloud Computing Security', authors: 'Johnson et al.', abstract: 'Security in cloud...', status: 'under_review', submitted_at: '2025-01-20' }
      ] 
    });
  }
  const reviewerId = req.session.user.id;
  // TODO: query reviews JOIN submissions where reviewer_id = $1 and submitted_at IS NULL
  res.json({ data: [] });
});

// Reviewer: get a single paper to review
router.get('/reviewer/assignments/:submissionId', requireAuth, requireRole('reviewer', 'editor', 'admin'), (req, res) => {
  const db = getDb();
  const submissionId = req.params.submissionId;
  if (!db) {
    // Mock data for testing
    return res.json({ 
      data: {
        id: submissionId,
        title: 'Machine Learning Advances',
        authors: 'Smith et al.',
        abstract: 'A comprehensive paper on ML techniques.',
        manuscript_path: '/uploads/sample-paper.pdf',
        status: 'under_review',
        submitted_at: '2025-01-15'
      }
    });
  }
  // TODO: query submission, verify reviewer is assigned
  res.json({ data: {} });
});

// Reviewer: submit review for a paper
router.post('/reviews', requireAuth, requireRole('reviewer', 'editor', 'admin'), (req, res) => {
  const db = getDb();
  if (!db) {
    return res.status(503).json({ message: 'Database not configured.' });
  }
  const { submission_id, recommendation, comment_author, comment_editor } = req.body || {};
  const reviewerId = req.session.user.id;
  if (!submission_id || !recommendation) {
    return res.status(400).json({ message: 'submission_id and recommendation required.' });
  }
  // TODO: insert review, mark as submitted_at NOW()
  res.status(201).json({ id: 1, submission_id, recommendation, message: 'Review submitted.' });
});

// Contact form (public)
router.post('/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ message: 'Name, email, and message required.' });
  // TODO: send email via nodemailer using process.env SMTP_*
  res.json({ success: true, message: 'Message received. We will respond shortly.' });
});

module.exports = router;
