import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import QuantityControl from '../components/QuantityControl.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { formatPrice, iceCreamEmoji } from '../utils.js';

const TAX_RATE = 0.05;
const PAYMENT_METHODS = [
  { value: 'CASH_ON_DELIVERY', label: 'Cash on delivery' },
  { value: 'UPI', label: 'UPI (pay on delivery)' },
  { value: 'CARD', label: 'Card (pay on delivery)' },
];

export default function Cart() {
  const { user } = useAuth();
  const { cart, add, decrement, clear, count, itemsTotal } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    if (user) {
      setAddress((a) => a || user.address || '');
      setPhone((p) => p || user.phone || '');
    }
  }, [user]);

  if (count === 0) {
    return (
      <div className="container page empty">
        <span className="empty-emoji">🍨</span>
        <h2>Your cart is empty</h2>
        <p className="muted">Add some scoops from a parlour to get started.</p>
        <Link to="/" className="btn btn-primary">Browse parlours</Link>
      </div>
    );
  }

  const s = cart.supplier;
  const taxes = Math.round(itemsTotal * TAX_RATE * 100) / 100;
  const grandTotal = itemsTotal + s.deliveryFee + taxes;
  const belowMin = itemsTotal < s.minOrderAmount;

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setPlacing(true);
    setError('');
    try {
      const order = await api.placeOrder({
        supplierId: s.id,
        items: cart.items.map((i) => ({ iceCreamId: i.id, quantity: i.quantity })),
        deliveryAddress: address,
        phone,
        paymentMethod,
        notes,
      });
      clear();
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container page">
      <h1>Checkout</h1>
      <div className="checkout">
        <div className="card">
          <div className="row-between">
            <h3>
              <Link to={`/suppliers/${s.id}`}>{s.name}</Link>
            </h3>
            <button className="btn btn-ghost btn-sm" onClick={clear}>Clear cart</button>
          </div>
          <ul className="cart-items">
            {cart.items.map((i) => (
              <li key={i.id}>
                <ProductImage src={i.imageUrl} emoji={iceCreamEmoji(i.category)} alt={i.name} className="cart-thumb" />
                <span className="grow">
                  {i.name}
                  <br />
                  <span className="muted small">{formatPrice(i.price)}</span>
                </span>
                <QuantityControl quantity={i.quantity} onAdd={() => add(s, i)} onRemove={() => decrement(i.id)} />
                <span className="line-total">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="bill">
            <h4>Bill details</h4>
            <div className="row-between"><span>Item total</span><span>{formatPrice(itemsTotal)}</span></div>
            <div className="row-between"><span>Delivery fee</span><span>{formatPrice(s.deliveryFee)}</span></div>
            <div className="row-between"><span>Taxes (5% GST)</span><span>{formatPrice(taxes)}</span></div>
            <div className="row-between total"><span>To pay</span><span>{formatPrice(grandTotal)}</span></div>
          </div>
        </div>

        <form className="card" onSubmit={placeOrder}>
          <h3>Delivery details</h3>
          <label>
            Delivery address
            <textarea required rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label>
            Phone
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
          <label>
            Notes for the parlour (optional)
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. extra napkins, no nuts" />
          </label>
          <fieldset className="payment">
            <legend>Payment method</legend>
            {PAYMENT_METHODS.map((m) => (
              <label key={m.value} className="radio">
                <input
                  type="radio"
                  name="payment"
                  value={m.value}
                  checked={paymentMethod === m.value}
                  onChange={() => setPaymentMethod(m.value)}
                />
                {m.label}
              </label>
            ))}
          </fieldset>

          {belowMin && (
            <div className="alert warn">
              Add {formatPrice(s.minOrderAmount - itemsTotal)} more to reach the minimum order of {formatPrice(s.minOrderAmount)}.
            </div>
          )}
          {error && <div className="alert error">{error}</div>}

          <button className="btn btn-primary btn-block" disabled={placing || belowMin}>
            {!user ? 'Log in to place order' : placing ? 'Placing order…' : `Place order · ${formatPrice(grandTotal)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
