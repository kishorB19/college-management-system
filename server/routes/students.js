const express = require('express');
const { authenticate, requireTeacher } = require('../middleware/auth');
const User = require('../models/User');

module.exports = function () {
  const router = express.Router();

  router.get('/', authenticate, requireTeacher, async (req, res) => {
    try {
      const students = await User.find({ role: 'student' })
        .select('name email roll_no class section phone')
        .sort({ roll_no: 1 });
      res.json(students.map(s => s.toJSON()));
    } catch (err) {
      console.error('Students GET error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.get('/profile', authenticate, async (req, res) => {
    try {
      const user = await User.findById(req.user.id)
        .select('name email role roll_no class section phone');

      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      res.json(user.toJSON());
    } catch (err) {
      console.error('Profile GET error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  return router;
};
