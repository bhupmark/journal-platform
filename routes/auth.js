const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

// Placeholder: replace with DB
const getDb = () => {
  try {
    return require('../db/client');
  } catch {
    return null;
  }
};

// POST /auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  const db = getDb();
  if (!db) {
    return res.status(503).json({ message: 'Database not configured. Use .env.' });
  }
  // TODO: find user, compare password, set session
  req.session.user = { id: 1, email: req.body.email, role: 'author' };
  return res.json({ success: true, user: req.session.user, redirect: '/submit' });
});

// POST /auth/register (author)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('full_name').trim().notEmpty()
], (req, res) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
  const db = getDb();
  if (!db) return res.status(503).json({ message: 'Database not configured.' });
  // TODO: hash password, insert user with role 'author'
  req.session.user = { id: 1, email: req.body.email, role: 'author' };
  return res.json({ success: true, user: req.session.user, redirect: '/submit' });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// GET /auth/me
router.get('/me', (req, res) => {
  if (!req.session || !req.session.user) return res.json({ user: null });
  res.json({ user: req.session.user });
});

module.exports = router;
