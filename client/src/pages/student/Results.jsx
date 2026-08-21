import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function Results() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const res = await api.get('/results');
      setResults(res.data);
    } catch (err) {
      setError('Failed to load results.');
    }
  };

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const groupedResults = results.reduce((acc, r) => {
    const sem = r.semester || 1;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(r);
    return acc;
  }, {});

  return (
    <div>
      <div className="page-header">
        <h1>Results</h1>
        <p>Your examination results and marks by semester</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {semesters.map(sem => {
          const semResults = groupedResults[sem];
          
          if (!semResults || semResults.length === 0) {
            return (
              <div key={sem} className="card" style={{ padding: '24px', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Semester {sem}</h3>
                <div className="empty-state" style={{ margin: 0, padding: '20px 0' }}>
                  <p>Yet to declare</p>
                </div>
              </div>
            );
          }

          const totalMarks = semResults.reduce((sum, r) => sum + r.marks, 0);
          const totalMax = semResults.reduce((sum, r) => sum + r.max_marks, 0);
          const overallPercentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : 0;

          return (
            <div key={sem} className="card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Semester {sem}</h3>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Marks</div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{totalMarks} / {totalMax}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Percentage</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: overallPercentage >= 60 ? 'var(--accent)' : 'var(--danger)' }}>{overallPercentage}%</div>
                  </div>
                </div>
              </div>
              
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Marks Obtained</th>
                      <th>Maximum Marks</th>
                      <th>Percentage</th>
                      <th>Exam Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semResults.map(r => {
                      const pct = (r.marks / r.max_marks * 100).toFixed(1);
                      const passed = pct >= 40;
                      return (
                        <tr key={r.id}>
                          <td style={{ fontWeight: 500 }}>{r.subject}</td>
                          <td style={{ fontWeight: 600 }}>{r.marks}</td>
                          <td>{r.max_marks}</td>
                          <td>
                            <span style={{ fontWeight: 600, color: pct >= 60 ? 'var(--accent)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                              {pct}%
                            </span>
                          </td>
                          <td>{r.exam_type}</td>
                          <td>
                            <span className={`badge ${passed ? 'badge-approved' : 'badge-rejected'}`}>
                              {passed ? 'Pass' : 'Fail'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
