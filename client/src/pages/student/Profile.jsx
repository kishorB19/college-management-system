import { useState, useEffect } from 'react';
import api from '../../api/api';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      setProfile(res.data);
    } catch (err) {
      setError('Failed to load profile.');
    }
  };

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!profile) {
    return <div className="empty-state"><p>Loading profile...</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Your personal and academic information</p>
      </div>

      <div className="card profile-card">
        <div className="card-header">
          <h3>Student Information</h3>
        </div>

        <div className="profile-field">
          <div className="label">Full Name</div>
          <div className="value">{profile.name}</div>
        </div>

        <div className="profile-field">
          <div className="label">Roll Number</div>
          <div className="value">{profile.roll_no || '—'}</div>
        </div>

        <div className="profile-field">
          <div className="label">Email</div>
          <div className="value">{profile.email}</div>
        </div>

        <div className="profile-field">
          <div className="label">Class</div>
          <div className="value">{profile.class || '—'}</div>
        </div>

        <div className="profile-field">
          <div className="label">Section</div>
          <div className="value">{profile.section || '—'}</div>
        </div>

        <div className="profile-field">
          <div className="label">Phone</div>
          <div className="value">{profile.phone || '—'}</div>
        </div>

        <div className="profile-field">
          <div className="label">Role</div>
          <div className="value" style={{ textTransform: 'capitalize' }}>{profile.role}</div>
        </div>
      </div>
    </div>
  );
}
