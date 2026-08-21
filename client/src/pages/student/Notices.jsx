import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function Notices() {
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (err) {
      setError('Failed to load notices.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1>Notices</h1>
        <p>Important announcements and updates from the college</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {notices.length === 0 ? (
        <div className="empty-state"><p>No notices available.</p></div>
      ) : (
        notices.map(notice => (
          <div key={notice.id} className="notice-item">
            <h4>{notice.title}</h4>
            <p>{notice.body}</p>
            <div className="notice-meta">
              <span>Posted by {notice.posted_by_name}</span>
              <span>{formatDate(notice.created_at)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
