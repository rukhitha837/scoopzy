import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate, formatPrice, statusLabel } from '../utils.js';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.myOrders().then(setOrders).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="container page"><div className="alert error">{error}</div></div>;
  if (!orders) return <div className="container page"><p className="muted">Loading orders…</p></div>;

  return (
    <div className="container page">
      <h1>My orders</h1>
      {orders.length === 0 ? (
        <div className="empty">
          <span className="empty-emoji">🧾</span>
          <p>You haven't ordered anything yet.</p>
          <Link to="/" className="btn btn-primary">Order now</Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="card order-card">
              <div className="row-between">
                <h3>{o.supplierName}</h3>
                <span className={`status status-${o.status}`}>{statusLabel(o.status)}</span>
              </div>
              <p className="muted small">Order #{o.id} · {formatDate(o.createdAt)}</p>
              <p className="small">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</p>
              <p className="price">{formatPrice(o.grandTotal)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
