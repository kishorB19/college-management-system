const express = require('express');
const { authenticate, requireTeacher } = require('../middleware/auth');
const Result = require('../models/Result');
const User = require('../models/User');

module.exports = function () {
  const router = express.Router();

  router.get('/', authenticate, async (req, res) => {
    try {
      if (req.user.role === 'teacher') {
        const { student_id, semester } = req.query;
        let query = {};
        if (student_id) query.student_id = student_id;
        if (semester) query.semester = semester;
        
        let results = await Result.find(query).populate('student_id', 'name roll_no').sort({ subject: 1 });
        
        results = results.map(r => {
          const doc = r.toJSON();
          doc.student_name = r.student_id ? r.student_id.name : null;
          doc.roll_no = r.student_id ? r.student_id.roll_no : null;
          doc.student_id = r.student_id ? r.student_id.id : null;
          return doc;
        });

        results.sort((a, b) => {
          const aRoll = a.roll_no || '';
          const bRoll = b.roll_no || '';
          if (aRoll !== bRoll) return aRoll.localeCompare(bRoll);
          return (a.subject || '').localeCompare(b.subject || '');
        });

        res.json(results);
      } else {
        const results = await Result.find({ student_id: req.user.id }).sort({ subject: 1 });
        res.json(results.map(r => r.toJSON()));
      }
    } catch (err) {
      console.error('Results GET error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.post('/', authenticate, requireTeacher, async (req, res) => {
    try {
      const { student_id, subject, semester, marks, max_marks, exam_type } = req.body;

      if (!student_id || !subject || !semester || marks === undefined || marks === null) {
        return res.status(400).json({ error: 'Student, subject, semester, and marks are required.' });
      }

      const type = exam_type || 'Mid-Term';
      const maxM = max_marks || 100;

      const existing = await Result.findOne({ student_id, subject, exam_type: type, semester });

      if (existing) {
        existing.marks = marks;
        existing.max_marks = maxM;
        existing.added_by = req.user.id;
        await existing.save();
      } else {
        await Result.create({
          student_id,
          subject,
          semester,
          marks,
          max_marks: maxM,
          exam_type: type,
          added_by: req.user.id
        });
      }

      res.json({ message: 'Result saved successfully.' });
    } catch (err) {
      console.error('Results POST error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  return router;
};
