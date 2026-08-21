import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ students: 0, todayAttendance: 0, pendingLeaves: 0, notices: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [studentsRes, leavesRes, noticesRes] = await Promise.all([
        api.get('/students'),
        api.get('/leaves'),
        api.get('/notices'),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const attendanceRes = await api.get('/attendance', { params: { date: today } });

      const pendingLeaves = leavesRes.data.filter(l => l.status === 'pending').length;
      const presentToday = attendanceRes.data.filter(a => a.status === 'present').length;

      setStats({
        students: studentsRes.data.length,
        todayAttendance: presentToday,
        pendingLeaves,
        notices: noticesRes.data.length,
      });
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of college management activities</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Students</div>
          <div className="stat-value">{stats.students}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Present Today</div>
          <div className="stat-value accent">{stats.todayAttendance}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Leaves</div>
          <div className="stat-value warning">{stats.pendingLeaves}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Notices</div>
          <div className="stat-value">{stats.notices}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/teacher/attendance" className="btn btn-primary">Mark Attendance</Link>
          <Link to="/teacher/results" className="btn btn-accent">Add Results</Link>
          <Link to="/teacher/notices" className="btn btn-outline">Post Notice</Link>
          <Link to="/teacher/leaves" className="btn btn-outline">Review Leaves</Link>
        </div>
      </div>
    </div>
  );
}

