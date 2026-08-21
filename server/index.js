const express = require('express');
const cors = require('cors');
const { initDB } = require('./db/init');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.redirect('http://localhost:5173');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CMS Server is running' });
});

initDB().then(() => {
  app.use('/api/auth', require('./routes/auth')());
  app.use('/api/attendance', require('./routes/attendance')());
  app.use('/api/results', require('./routes/results')());
  app.use('/api/notices', require('./routes/notices')());
  app.use('/api/fees', require('./routes/fees')());
  app.use('/api/leaves', require('./routes/leaves')());
  app.use('/api/students', require('./routes/students')());

  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  app.get('*', (req, res) => {
    res.redirect(`http://localhost:5173${req.originalUrl}`);
  });

  app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`CMS Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
