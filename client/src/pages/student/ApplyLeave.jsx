import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function ApplyLeave() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const res = await api.get('/leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to load leaves:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      await api.post('/leaves', {
        from_date: fromDate,
        to_date: toDate,
        reason,
      });
      setMessage('Leave application submitted successfully.');
      setFromDate('');
      setToDate('');
      setReason('');
      loadLeaves();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit leave application.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Leave Application</h1>
        <p>Apply for leave and track your application status</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>New Application</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="leave-from">From Date</label>
              <input
                id="leave-from"
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="leave-to">To Date</label>
              <input
                id="leave-to"
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                min={fromDate}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="leave-reason">Reason</label>
            <textarea
              id="leave-reason"
              className="form-control"
              placeholder="Provide a reason for your leave request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>

      {leaves.length > 0 && (
        <>
          <div className="page-header" style={{ marginTop: '16px' }}>
            <h1 style={{ fontSize: '18px' }}>My Applications</h1>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Reason</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map(leave => (
                    <tr key={leave.id}>
                      <td>{formatDate(leave.from_date)}</td>
                      <td>{formatDate(leave.to_date)}</td>
                      <td style={{ maxWidth: '300px' }}>{leave.reason}</td>
                      <td>
                        <span className={`badge badge-${leave.status}`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
