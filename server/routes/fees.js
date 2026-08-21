const express = require('express');
const { authenticate } = require('../middleware/auth');
const Fee = require('../models/Fee');
const User = require('../models/User');

module.exports = function () {
  const router = express.Router();

  router.get('/', authenticate, async (req, res) => {
    try {
      if (req.user.role === 'student') {
        const fees = await Fee.find({ student_id: req.user.id }).sort({ due_date: 1 });
        res.json(fees.map(f => f.toJSON()));
      } else {
        const { student_id } = req.query;
        let query = {};
        if (student_id) query.student_id = student_id;

        let fees = await Fee.find(query).populate('student_id', 'name roll_no').sort({ due_date: 1 });

        fees = fees.map(f => {
          const doc = f.toJSON();
          doc.student_name = f.student_id ? f.student_id.name : null;
          doc.roll_no = f.student_id ? f.student_id.roll_no : null;
          doc.student_id = f.student_id ? f.student_id.id : null;
          return doc;
        });

        fees.sort((a, b) => {
          const aRoll = a.roll_no || '';
          const bRoll = b.roll_no || '';
          if (aRoll !== bRoll) return aRoll.localeCompare(bRoll);
          return (a.due_date || '').localeCompare(b.due_date || '');
        });

        res.json(fees);
      }
    } catch (err) {
      console.error('Fees GET error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  return router;
};
