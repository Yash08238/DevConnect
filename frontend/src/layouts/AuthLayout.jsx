import { Outlet, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  // Redirect to home if user is already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-container">
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: '1', minHeight: 'calc(100vh - 70px)' }}>
        <Outlet />
      </div>
    </div>
  );
}
