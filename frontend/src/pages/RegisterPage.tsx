
import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <span className="mono" style={{ color: 'var(--text3)', fontSize: 13 }}>
          Authenticating…
        </span>
      </div>
    );
  }

  const set =
    (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        email: form.email,
        password: form.password,
      });

      navigate('/login?registered=1');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-bg-grid" />

      <div className="auth-card fade-up">
        <div className="auth-header">
          <div className="auth-logo">⬡</div>

          <h1 className="auth-title">Create account</h1>

          <p className="auth-desc">
            Your identity is protected. Submit tips anonymously.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email address</label>

            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>

            <input
              className="input"
              type="password"
              placeholder="min. 8 characters"
              value={form.password}
              onChange={set('password')}
              required
              minLength={8}
            />
          </div>

          <div className="field">
            <label>Confirm password</label>

            <input
              className="input"
              type="password"
              placeholder="repeat password"
              value={form.confirm}
              onChange={set('confirm')}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                Creating account…
              </>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

