const jwt = require('jsonwebtoken');

const JWT_SECRET = 'cms_college_secret_key_2026';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const mongoose = require('mongoose');
    if (!mongoose.isValidObjectId(decoded.id)) {
      return res.status(401).json({ error: 'Session expired due to database migration. Please log in again.' });
    }

    req.user = decoded;
    console.log('Authenticated User:', req.user);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireTeacher(req, res, next) {
  if (req.user.role !== 'teacher') {
    console.error('requireTeacher FAILED for user:', req.user);
    return res.status(403).json({ error: 'Access denied. Teacher role required.' });
  }
  next();
}

function requireStudent(req, res, next) {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied. Student role required.' });
  }
  next();
}

module.exports = { authenticate, requireTeacher, requireStudent, JWT_SECRET };
