import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function PostNotice() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notices, setNotices] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (err) {
      console.error('Failed to load notices:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPosting(true);
    setMessage('');
    setError('');

    try {
      await api.post('/notices', { title, body });
      setMessage('Notice posted successfully.');
      setTitle('');
      setBody('');
      loadNotices();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post notice.');
    } finally {
      setPosting(false);
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
        <h1>Post Notice</h1>
        <p>Create a new notice visible to all students</p>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div className="card-header">
          <h3>New Notice</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="notice-title">Title</label>
            <input
              id="notice-title"
              type="text"
              className="form-control"
              placeholder="Enter notice title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="notice-body">Content</label>
            <textarea
              id="notice-body"
              className="form-control"
              placeholder="Enter notice content..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={posting}>
            {posting ? 'Posting...' : 'Post Notice'}
          </button>
        </form>
      </div>

      <div className="page-header" style={{ marginTop: '16px' }}>
        <h1 style={{ fontSize: '18px' }}>All Notices</h1>
      </div>

      {notices.length === 0 ? (
        <div className="empty-state"><p>No notices posted yet.</p></div>
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
