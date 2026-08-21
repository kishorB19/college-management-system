const express = require('express');
const { authenticate, requireTeacher } = require('../middleware/auth');
const Leave = require('../models/Leave');
const User = require('../models/User');

module.exports = function () {
  const router = express.Router();

  router.get('/', authenticate, async (req, res) => {
    try {
      if (req.user.role === 'teacher') {
        let leaves = await Leave.find().populate('student_id', 'name roll_no');

        leaves = leaves.map(l => {
          const doc = l.toJSON();
          doc.student_name = l.student_id ? l.student_id.name : null;
          doc.roll_no = l.student_id ? l.student_id.roll_no : null;
          doc.student_id = l.student_id ? l.student_id.id : null;
          return doc;
        });

        leaves.sort((a, b) => {
          const aStatus = a.status === 'pending' ? 0 : 1;
          const bStatus = b.status === 'pending' ? 0 : 1;
          if (aStatus !== bStatus) return aStatus - bStatus;
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });

        res.json(leaves);
      } else {
        const leaves = await Leave.find({ student_id: req.user.id }).sort({ created_at: -1 });
        res.json(leaves.map(l => l.toJSON()));
      }
    } catch (err) {
      console.error('Leaves GET error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.post('/', authenticate, async (req, res) => {
    try {
      if (req.user.role !== 'student') {
        return res.status(403).json({ error: 'Only students can apply for leave.' });
      }

      const { from_date, to_date, reason } = req.body;

      if (!from_date || !to_date || !reason) {
        return res.status(400).json({ error: 'From date, to date, and reason are required.' });
      }

      await Leave.create({
        student_id: req.user.id,
        from_date,
        to_date,
        reason
      });

      res.json({ message: 'Leave application submitted successfully.' });
    } catch (err) {
      console.error('Leaves POST error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.put('/:id', authenticate, requireTeacher, async (req, res) => {
    try {
      const { status } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be "approved" or "rejected".' });
      }

      const leave = await Leave.findById(req.params.id);
      if (!leave) {
        return res.status(404).json({ error: 'Leave application not found.' });
      }

      leave.status = status;
      leave.reviewed_by = req.user.id;
      await leave.save();

      res.json({ message: `Leave application ${status}.` });
    } catch (err) {
      console.error('Leaves PUT error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  return router;
};
