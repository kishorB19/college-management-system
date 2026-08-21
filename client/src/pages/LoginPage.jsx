import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

export default function LoginPage() {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      if (user.role !== role) {
        setError(`This account is registered as a ${user.role}, not a ${role}.`);
        setLoading(false);
        return;
      }

      login(user, token);
      navigate(user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <h1>College Management System</h1>
            <p>Sign in to your account</p>
          </div>

          <div className="role-toggle">
            <button
              type="button"
              className={role === 'student' ? 'active' : ''}
              onClick={() => { setRole('student'); setError(''); }}
            >
              Student
            </button>
            <button
              type="button"
              className={role === 'teacher' ? 'active' : ''}
              onClick={() => { setRole('teacher'); setError(''); }}
            >
              Teacher
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-hint">
            <p>
              <strong>Demo Credentials</strong><br />
              Teacher: teacher@college.com / teacher123<br />
              Student: rahul@college.com / student123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
