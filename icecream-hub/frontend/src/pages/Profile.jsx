import { useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      setUser(await api.updateProfile(form));
      setMessage({ type: 'success', text: 'Profile saved' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <h1>My profile</h1>
        <p className="muted">{user.email}</p>
        <label>Full name<input required value={form.name} onChange={update('name')} /></label>
        <label>Phone<input type="tel" value={form.phone} onChange={update('phone')} /></label>
        <label>Default delivery address<textarea rows={3} value={form.address} onChange={update('address')} /></label>
        {message && <div className={`alert ${message.type}`}>{message.text}</div>}
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
      </form>
    </div>
  );
}
