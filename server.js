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
// Role-protected panel routes (admin/editor/reviewer)
const panelsRouter = require('./routes/panels');
app.use('/', panelsRouter);

// Page routes - serve HTML from public/pages
const pages = [
  '', 'about', 'editorial-board', 'submit', 'issues', 'guidelines',
  'indexing', 'contact', 'login', 'register', 'track', 'dashboard',
  'admin', 'editor', 'reviewer-portal', 'reviewer', 'downloads'
];
pages.forEach(p => {
  const name = p || 'index';
  app.get(p ? `/${p}` : '/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', `${name}.html`));
  });
});

// Serve .html extension routes for direct access (e.g., /guidelines.html)
pages.forEach(p => {
  const name = p || 'index';
  app.get(`/${name}.html`, (req, res) => {
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
