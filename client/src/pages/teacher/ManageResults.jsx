import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function ManageResults() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [existingResults, setExistingResults] = useState([]);
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('1');
  const [marks, setMarks] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [examType, setExamType] = useState('Mid-Term');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadResults();
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      setError('Failed to load students.');
    }
  };

  const loadResults = async () => {
    try {
      const res = await api.get('/results', { params: { student_id: selectedStudent } });
      setExistingResults(res.data);
    } catch (err) {
      console.error('Failed to load results:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.post('/results', {
        student_id: selectedStudent,
        subject,
        semester: Number(semester),
        marks: Number(marks),
        max_marks: Number(maxMarks),
        exam_type: examType,
      });
      setMessage(`Result saved: Semester ${semester} - ${subject} — ${marks}/${maxMarks}`);
      setSubject('');
      setMarks('');
      loadResults();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save result.');
    } finally {
      setSaving(false);
    }
  };

  const selectedStudentInfo = students.find(s => s.id === selectedStudent);

  return (
    <div>
      <div className="page-header">
        <h1>Manage Results</h1>
        <p>Add or update student examination results</p>
      </div>

      <div className="action-bar">
        <div className="form-group">
          <label htmlFor="res-student">Select Student</label>
          <select
            id="res-student"
            className="form-control"
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
          >
            <option value="">-- Select Student --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.roll_no} — {s.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="res-exam">Exam Type</label>
          <select id="res-exam" className="form-control" value={examType} onChange={(e) => setExamType(e.target.value)}>
            <option value="Mid-Term">Mid-Term</option>
            <option value="End-Term">End-Term</option>
            <option value="Internal">Internal</option>
          </select>
        </div>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {selectedStudent && (
        <>
          <div className="card">
            <div className="card-header">
              <h3>Add Result {selectedStudentInfo ? `for ${selectedStudentInfo.name}` : ''}</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="res-subject">Subject</label>
                  <select id="res-subject" className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)} required>
                    <option value="">-- Select Subject --</option>
                    {subjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="res-semester">Semester</label>
                  <select id="res-semester" className="form-control" value={semester} onChange={(e) => setSemester(e.target.value)} required>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="res-marks">Marks Obtained</label>
                  <input id="res-marks" type="number" className="form-control" min="0" max={maxMarks} value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="e.g. 85" required />
                </div>
                <div className="form-group">
                  <label htmlFor="res-max">Maximum Marks</label>
                  <input id="res-max" type="number" className="form-control" min="1" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="btn btn-accent" disabled={saving}>
                {saving ? 'Saving...' : 'Save Result'}
              </button>
            </form>
          </div>

          {existingResults.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3>Current Results</h3>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Semester</th>
                      <th>Subject</th>
                      <th>Marks</th>
                      <th>Max Marks</th>
                      <th>Percentage</th>
                      <th>Exam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingResults.map(r => (
                      <tr key={r.id}>
                        <td>{r.semester}</td>
                        <td>{r.subject}</td>
                        <td style={{ fontWeight: 600 }}>{r.marks}</td>
                        <td>{r.max_marks}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: (r.marks / r.max_marks * 100) >= 60 ? 'var(--accent)' : 'var(--danger)' }}>
                            {(r.marks / r.max_marks * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td>{r.exam_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!selectedStudent && (
        <div className="empty-state"><p>Select a student to manage their results.</p></div>
      )}
    </div>
  );
}
