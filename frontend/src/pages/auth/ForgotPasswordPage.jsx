import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-card fade-in">
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Reset Password</h2>
        
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '20px', fontSize: '0.9rem' }}>
              If an account exists for {email}, a password reset link has been sent.
            </div>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: 'var(--text-sub)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit}>
              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </Button>
            </form>
            <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem' }}>
              <Link to="/login" style={{ fontWeight: '600' }}>
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
