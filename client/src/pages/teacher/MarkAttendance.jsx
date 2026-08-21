import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function MarkAttendance() {
  const [students, setStudents] = useState([]);
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0 && subject) {
      loadExistingAttendance();
    }
  }, [date, students, subject]);

  const loadStudents = async () => {
    try {
      const res = await api.get('/attendance/students');
      setStudents(res.data);
      const initial = {};
      res.data.forEach(s => { initial[s.id] = 'present'; });
      setAttendance(initial);
    } catch (err) {
      setError('Failed to load students.');
    }
  };

  const loadExistingAttendance = async () => {
    try {
      const res = await api.get('/attendance', { params: { date, subject } });
      if (res.data.length > 0) {
        const existing = {};
        students.forEach(s => { existing[s.id] = 'present'; });
        res.data.forEach(a => { existing[a.student_id] = a.status; });
        setAttendance(existing);
      } else {
        const initial = {};
        students.forEach(s => { initial[s.id] = 'present'; });
        setAttendance(initial);
      }
    } catch (err) {
    }
  };

  const toggleStatus = (studentId) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : 'present',
    }));
  };

  const handleSubmit = async () => {
    if (!subject) {
      setError('Please enter a subject.');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    const records = Object.entries(attendance).map(([student_id, status]) => ({
      student_id: student_id,
      status,
    }));

    try {
      const res = await api.post('/attendance', { date, subject, records });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === 'present').length;
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length;

  return (
    <div>
      <div className="page-header">
        <h1>Mark Attendance</h1>
        <p>Select a date and mark attendance for each student</p>
      </div>

      <div className="action-bar">
        <div className="form-group">
          <label htmlFor="att-subject">Subject</label>
          <input
            id="att-subject"
            type="text"
            className="form-control"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Mathematics"
          />
        </div>
        <div className="form-group">
          <label htmlFor="att-date">Date</label>
          <input
            id="att-date"
            type="date"
            className="form-control"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          <span>Present: <strong style={{ color: 'var(--accent)' }}>{presentCount}</strong></span>
          <span>Absent: <strong style={{ color: 'var(--danger)' }}>{absentCount}</strong></span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="attendance-list">
        {students.map((student) => (
          <div key={student.id} className="attendance-item">
            <div className="student-info">
              <span className="roll">{student.roll_no}</span>
              <span className="name">{student.name}</span>
            </div>
            <div className="attendance-toggle">
              <button
                className={attendance[student.id] === 'present' ? 'present' : ''}
                onClick={() => { if (attendance[student.id] !== 'present') toggleStatus(student.id); }}
              >
                Present
              </button>
              <button
                className={attendance[student.id] === 'absent' ? 'absent' : ''}
                onClick={() => { if (attendance[student.id] !== 'absent') toggleStatus(student.id); }}
              >
                Absent
              </button>
            </div>
          </div>
        ))}
      </div>

      {students.length === 0 && (
        <div className="empty-state"><p>No students found.</p></div>
      )}
    </div>
  );
}
