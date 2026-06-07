import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !username || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const success = await register({ name, username, email, password });
      if (success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card fade-in">
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Create Account</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '24px' }}>
          Join the developer hub to share your builds
        </p>

        {error && (
          <div style={{ color: 'var(--error)', fontSize: '0.85rem', marginBottom: '16px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            id="name"
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            id="username"
            label="Username"
            placeholder="johndoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

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

          <Button type="submit" variant="primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-sub)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: '600' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
