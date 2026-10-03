import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductImage from '../components/ProductImage.jsx';
import { ORDER_STEPS, formatDate, formatPrice, statusLabel } from '../utils.js';

const POLL_MS = 10000;

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let active = true;
    const load = () => api.order(id).then((o) => active && setOrder(o)).catch((e) => active && setError(e.message));
    load();
    const timer = setInterval(load, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);

  if (error) return <div className="container page"><div className="alert error">{error}</div></div>;
  if (!order) return <div className="container page"><p className="muted">Loading…</p></div>;

  const cancelled = order.status === 'CANCELLED';
  const stepIndex = ORDER_STEPS.indexOf(order.status);
  const canCancel = order.status === 'PLACED' || order.status === 'CONFIRMED';

  const cancel = async () => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      setOrder(await api.cancelOrder(order.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="container page narrow">
      {location.state?.justPlaced && <div className="alert success">🎉 Order placed! Your ice cream is on its way.</div>}
      <Link to="/orders" className="small">← All orders</Link>
      <div className="row-between">
        <h1>Order #{order.id}</h1>
        <span className={`status status-${order.status}`}>{statusLabel(order.status)}</span>
      </div>
      <p className="muted">
        From <Link to={`/suppliers/${order.supplierId}`}>{order.supplierName}</Link> · {formatDate(order.createdAt)}
      </p>

      {!cancelled && (
        <ol className="tracker">
          {ORDER_STEPS.map((step, i) => (
            <li key={step} className={i <= stepIndex ? 'done' : ''}>
              <span className="dot" />
              <span className="small">{statusLabel(step)}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="card">
        <ul className="cart-items">
          {order.items.map((i, idx) => (
            <li key={idx}>
              <ProductImage src={i.imageUrl} emoji="🍨" alt={i.name} className="cart-thumb" />
              <span className="grow">{i.name} × {i.quantity}</span>
              <span>{formatPrice(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="bill">
          <div className="row-between"><span>Item total</span><span>{formatPrice(order.itemsTotal)}</span></div>
          <div className="row-between"><span>Delivery fee</span><span>{formatPrice(order.deliveryFee)}</span></div>
          <div className="row-between"><span>Taxes</span><span>{formatPrice(order.taxes)}</span></div>
          <div className="row-between total"><span>Total</span><span>{formatPrice(order.grandTotal)}</span></div>
        </div>
      </div>

      <div className="card">
        <p><b>Deliver to:</b> {order.deliveryAddress}</p>
        {order.phone && <p><b>Phone:</b> {order.phone}</p>}
        <p><b>Payment:</b> {order.paymentMethod.replaceAll('_', ' ').toLowerCase()}</p>
        {order.notes && <p><b>Notes:</b> {order.notes}</p>}
      </div>

      {canCancel && (
        <button className="btn btn-danger" onClick={cancel} disabled={cancelling}>
          {cancelling ? 'Cancelling…' : 'Cancel order'}
        </button>
      )}
    </div>
  );
}
