import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import CoursePage from './pages/CoursePage';
import ExamPage from './pages/ExamPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ResultsPage from './pages/ResultsPage';
import Tutor from './pages/Tutor';
import Upload from './pages/Upload';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-brand-deep">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/course" element={<ProtectedRoute><CoursePage /></ProtectedRoute>} />
        <Route path="/exam" element={<ProtectedRoute><ExamPage /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><ResultsPage /></ProtectedRoute>} />
        <Route path="/tutor" element={<ProtectedRoute><Tutor /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}
