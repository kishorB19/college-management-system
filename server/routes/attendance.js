const express = require('express');
const { authenticate, requireTeacher } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

module.exports = function () {
  const router = express.Router();

  router.get('/', authenticate, async (req, res) => {
    try {
      if (req.user.role === 'teacher') {
        const { student_id, date, subject } = req.query;
        let query = {};

        if (student_id) { query.student_id = student_id; }
        if (date) { query.date = date; }
        if (subject) { query.subject = subject; }
        
        let attendances = await Attendance.find(query).populate('student_id', 'name roll_no').sort({ date: -1 });
        
        attendances = attendances.map(a => {
          const doc = a.toJSON();
          doc.student_name = a.student_id ? a.student_id.name : null;
          doc.roll_no = a.student_id ? a.student_id.roll_no : null;
          doc.student_id = a.student_id ? a.student_id.id : null;
          return doc;
        });

        attendances.sort((a, b) => {
          if (a.date !== b.date) return new Date(b.date) - new Date(a.date);
          return (a.roll_no || '').localeCompare(b.roll_no || '');
        });

        res.json(attendances);
      } else {
        const attendances = await Attendance.find({ student_id: req.user.id }).sort({ date: -1 });
        res.json(attendances.map(a => a.toJSON()));
      }
    } catch (err) {
      console.error('Attendance GET error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.get('/students', authenticate, requireTeacher, async (req, res) => {
    try {
      const students = await User.find({ role: 'student' })
        .select('name roll_no class section')
        .sort({ roll_no: 1 });
      res.json(students.map(s => s.toJSON()));
    } catch (err) {
      console.error('Attendance students error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.post('/', authenticate, requireTeacher, async (req, res) => {
    try {
      const { date, subject, records } = req.body;

      if (!date || !subject || !records || !Array.isArray(records)) {
        return res.status(400).json({ error: 'Date, subject, and attendance records are required.' });
      }

      await Attendance.deleteMany({ date, subject });

      const attendances = records.map(item => ({
        student_id: item.student_id,
        subject,
        date,
        status: item.status,
        marked_by: req.user.id
      }));

      await Attendance.insertMany(attendances);

      res.json({ message: 'Attendance marked successfully for ' + subject + ' on ' + date });
    } catch (err) {
      console.error('Attendance POST error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  return router;
};
