const express = require('express');
const { authenticate, requireTeacher } = require('../middleware/auth');
const Notice = require('../models/Notice');
const User = require('../models/User');

module.exports = function () {
  const router = express.Router();

  router.get('/', authenticate, async (req, res) => {
    try {
      let notices = await Notice.find()
        .populate('posted_by', 'name')
        .sort({ created_at: -1 });

      notices = notices.map(n => {
        const doc = n.toJSON();
        doc.posted_by_name = n.posted_by ? n.posted_by.name : null;
        doc.posted_by = n.posted_by ? n.posted_by.id : null;
        return doc;
      });

      res.json(notices);
    } catch (err) {
      console.error('Notices GET error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  router.post('/', authenticate, requireTeacher, async (req, res) => {
    try {
      const { title, body } = req.body;

      if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required.' });
      }

      await Notice.create({
        title,
        body,
        posted_by: req.user.id
      });

      res.json({ message: 'Notice posted successfully.' });
    } catch (err) {
      console.error('Notices POST error:', err);
      res.status(500).json({ error: 'Internal server error.' });
    }
  });

  return router;
};
