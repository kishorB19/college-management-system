import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data);
    } catch (err) {
      setError('Failed to load students.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Student Directory</h1>
        <p>{students.length} students enrolled</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {students.length === 0 ? (
        <div className="empty-state"><p>No students found.</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td style={{ fontWeight: 600 }}>{student.roll_no}</td>
                    <td style={{ fontWeight: 500 }}>{student.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{student.email}</td>
                    <td>{student.class}</td>
                    <td>{student.section}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{student.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
