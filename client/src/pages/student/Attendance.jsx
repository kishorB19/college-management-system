import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const res = await api.get('/attendance');
      setRecords(res.data);
    } catch (err) {
      setError('Failed to load attendance records.');
    }
  };

  const getProgressClass = (pct) => {
    if (pct >= 75) return 'good';
    if (pct >= 60) return 'warning';
    return 'danger';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const groupedRecords = records.reduce((acc, record) => {
    const subject = record.subject || 'General';
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(record);
    return acc;
  }, {});

  const subjects = Object.keys(groupedRecords).sort();

  return (
    <div>
      <div className="page-header">
        <h1>Attendance</h1>
        <p>Your subject-wise attendance records and statistics</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {subjects.length === 0 && !error ? (
        <div className="empty-state"><p>No attendance records found.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {subjects.map(subject => {
            const subjectRecords = groupedRecords[subject];
            const totalDays = subjectRecords.length;
            const presentDays = subjectRecords.filter(r => r.status === 'present').length;
            const absentDays = totalDays - presentDays;
            const percentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;
            const progressClass = getProgressClass(percentage);

            return (
              <div key={subject} className="subject-section" style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', backgroundColor: 'var(--surface-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '20px', margin: 0, color: 'var(--text-color)' }}>{subject}</h2>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: `var(--${progressClass})` }}>{percentage}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{presentDays} / {totalDays} classes</div>
                  </div>
                </div>

                <div className="progress-bar" style={{ marginBottom: '16px' }}>
                  <div
                    className={`fill ${progressClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {percentage < 75 && (
                  <p style={{ marginTop: '-8px', marginBottom: '20px', fontSize: '13px', color: 'var(--danger)', fontWeight: 500 }}>
                    Attendance is below the required 75% minimum.
                  </p>
                )}

                <div className="table-wrapper" style={{ border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjectRecords.map(record => (
                        <tr key={record.id}>
                          <td>{formatDate(record.date)}</td>
                          <td>
                            <span className={`badge badge-${record.status}`}>
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
