import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register(form);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>Sign up</h1>
        <label>Full name<input required value={form.name} onChange={update('name')} /></label>
        <label>Email<input type="email" required value={form.email} onChange={update('email')} /></label>
        <label>
          Password
          <input type="password" required minLength={6} value={form.password} onChange={update('password')} />
        </label>
        <label>Phone<input type="tel" value={form.phone} onChange={update('phone')} /></label>
        <label>Delivery address<textarea rows={2} value={form.address} onChange={update('address')} /></label>
        {error && <div className="alert error">{error}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="muted small center">
          Already have an account? <Link to="/login" state={location.state}>Log in</Link>
        </p>
      </form>
    </div>
  );
}
