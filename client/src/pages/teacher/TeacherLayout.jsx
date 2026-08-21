import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TeacherLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>College Management</h2>
          <div className="sidebar-role">Teacher Panel</div>
          <div className="sidebar-user">{user?.name}</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/teacher" end>Dashboard</NavLink>
          <NavLink to="/teacher/attendance">Mark Attendance</NavLink>
          <NavLink to="/teacher/results">Manage Results</NavLink>
          <NavLink to="/teacher/notices">Post Notice</NavLink>
          <NavLink to="/teacher/leaves">Leave Requests</NavLink>
          <NavLink to="/teacher/students">View Students</NavLink>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout}>Sign Out</button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
