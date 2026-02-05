const express = require('express');
const router = express.Router();

// Role-protected panel routes for admin, editor, and reviewer
// These can be expanded based on specific panel requirements

// Placeholder routes - implement specific panel logic as needed
router.get('/admin-panel', (req, res) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  res.sendFile(__dirname + '/../public/pages/admin.html');
});

router.get('/editor-panel', (req, res) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'editor') {
    return res.status(403).json({ message: 'Editor access required' });
  }
  res.sendFile(__dirname + '/../public/pages/editor.html');
});

router.get('/reviewer-panel', (req, res) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'reviewer') {
    return res.status(403).json({ message: 'Reviewer access required' });
  }
  res.sendFile(__dirname + '/../public/pages/reviewer-portal.html');
});

module.exports = router;
