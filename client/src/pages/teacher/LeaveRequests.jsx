import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data);
    } catch (err) {
      setError('Failed to load leave requests.');
    }
  };

  const handleAction = async (id, status) => {
    setMessage('');
    setError('');
    try {
      await api.put(`/leaves/${id}`, { status });
      setMessage(`Leave application ${status}.`);
      loadLeaves();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update leave status.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const pendingCount = leaves.filter(l => l.status === 'pending').length;

  return (
    <div>
      <div className="page-header">
        <h1>Leave Requests</h1>
        <p>{pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {leaves.length === 0 ? (
        <div className="empty-state"><p>No leave applications found.</p></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll No</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map(leave => (
                  <tr key={leave.id}>
                    <td style={{ fontWeight: 500 }}>{leave.student_name}</td>
                    <td>{leave.roll_no}</td>
                    <td>{formatDate(leave.from_date)}</td>
                    <td>{formatDate(leave.to_date)}</td>
                    <td style={{ maxWidth: '220px' }}>{leave.reason}</td>
                    <td>
                      <span className={`badge badge-${leave.status}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-accent btn-sm"
                            onClick={() => handleAction(leave.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleAction(leave.id, 'rejected')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
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
