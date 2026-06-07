import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const success = await login(email, password);
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card fade-in">
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Connect with developers and showcase your builds
        </p>

        {error && (
          <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" variant="primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: '600' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
