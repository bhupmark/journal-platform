require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'journal-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// Ensure uploads dir exists
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API routes (mount after static so /api/* is explicit)
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
app.use('/api', apiRouter);
app.use('/auth', authRouter);
// Role-protected panel routes (admin/editor/reviewer) - load if present
const panelsPath = path.join(__dirname, 'routes', 'panels.js');
if (fs.existsSync(panelsPath)) {
  try {
    const panelsRouter = require('./routes/panels');
    app.use('/', panelsRouter);
  } catch (err) {
    console.warn('Could not load routes/panels.js:', err.message);
  }
} else {
  // panels.js is optional; continue without role-protected page routes
  console.info('routes/panels.js not found — skipping panel routes.');
}

// Reviewer portal (role-protected)
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) return res.redirect('/login');
  next();
};
const requireRole = (...roles) => (req, res, next) => {
  if (!req.session || !req.session.user) return res.redirect('/login');
  if (!roles.includes(req.session.user.role)) return res.status(403).send('Forbidden');
  next();
};

app.get('/reviewer-portal', requireAuth, requireRole('reviewer', 'editor', 'admin'), (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'reviewer-portal.html'));
});

// Page routes - serve HTML from public/pages
const pages = [
  '', 'about', 'editorial-board', 'submit', 'issues', 'guidelines',
  'indexing', 'contact', 'login', 'register', 'track', 'dashboard'
];
pages.forEach(p => {
  const name = p || 'index';
  app.get(p ? `/${p}` : '/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', `${name}.html`));
  });
});

// SPA-style fallback for client-side routes (optional)
app.get('/issues/:year/:volume/:issue', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'issues.html'));
});

app.listen(PORT, () => {
  console.log(`Journal Platform running at http://localhost:${PORT}`);
});
