import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function StudentLayout() {
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
          <div className="sidebar-role">Student Portal</div>
          <div className="sidebar-user">{user?.name}</div>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/student" end>My Profile</NavLink>
          <NavLink to="/student/attendance">Attendance</NavLink>
          <NavLink to="/student/results">Results</NavLink>
          <NavLink to="/student/notices">Notices</NavLink>
          <NavLink to="/student/fees">Fees</NavLink>
          <NavLink to="/student/leaves">Leave</NavLink>
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
