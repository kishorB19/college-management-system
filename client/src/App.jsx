import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import TeacherLayout from './pages/teacher/TeacherLayout';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import ManageResults from './pages/teacher/ManageResults';
import PostNotice from './pages/teacher/PostNotice';
import LeaveRequests from './pages/teacher/LeaveRequests';
import StudentList from './pages/teacher/StudentList';
import StudentLayout from './pages/student/StudentLayout';
import Profile from './pages/student/Profile';
import Attendance from './pages/student/Attendance';
import Results from './pages/student/Results';
import Notices from './pages/student/Notices';
import Fees from './pages/student/Fees';
import ApplyLeave from './pages/student/ApplyLeave';

function ProtectedRoute({ role, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}

function LoginRedirect() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <LoginPage />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginRedirect />} />

          <Route
            path="/teacher"
            element={
              <ProtectedRoute role="teacher">
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<TeacherDashboard />} />
            <Route path="attendance" element={<MarkAttendance />} />
            <Route path="results" element={<ManageResults />} />
            <Route path="notices" element={<PostNotice />} />
            <Route path="leaves" element={<LeaveRequests />} />
            <Route path="students" element={<StudentList />} />
          </Route>

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Profile />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="results" element={<Results />} />
            <Route path="notices" element={<Notices />} />
            <Route path="fees" element={<Fees />} />
            <Route path="leaves" element={<ApplyLeave />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
