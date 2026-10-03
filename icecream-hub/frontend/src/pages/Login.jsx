import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(email, password);
      navigate(location.state?.from || (user.role === 'ADMIN' ? '/admin' : '/'), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Log in</h1>
        <label>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {error && <div className="alert error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="muted small center">
          New here? <Link to="/register" state={location.state}>Create an account</Link>
        </p>
        <div className="demo-creds small">
          <b>Demo accounts</b>
          <br />Customer: user@icecreamhub.com / user123
          <br />Admin: admin@icecreamhub.com / admin123
        </div>
      </form>
    </div>
  );
}
