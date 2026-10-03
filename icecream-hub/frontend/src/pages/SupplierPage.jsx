import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import QuantityControl from '../components/QuantityControl.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { formatPrice, iceCreamEmoji, supplierEmoji, supplierGradient } from '../utils.js';

export default function SupplierPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('All');
  const [pendingItem, setPendingItem] = useState(null);
  const { cart, add, decrement, quantityOf, count, itemsTotal } = useCart();

  useEffect(() => {
    api.supplier(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  const categories = useMemo(
    () => ['All', ...new Set((data?.menu || []).map((i) => i.category).filter(Boolean))],
    [data]
  );

  if (error) return <div className="container page"><div className="alert error">{error}</div></div>;
  if (!data) return <div className="container page"><p className="muted">Loading…</p></div>;

  const { supplier: s, menu } = data;
  const visible = category === 'All' ? menu : menu.filter((i) => i.category === category);
  const otherSupplierInCart = cart.supplier && cart.supplier.id !== s.id && cart.items.length > 0;

  const handleAdd = (item) => {
    if (otherSupplierInCart) setPendingItem(item);
    else add(s, item);
  };

  return (
    <div className="container page">
      <div className="supplier-header" style={{ background: supplierGradient(s.id) }}>
        <ProductImage src={s.imageUrl} emoji={supplierEmoji(s)} alt={s.name} className="header-image" />
        <div>
          <h1>{s.name}</h1>
          <p>{s.description}</p>
          <p className="small">{s.tags.join(' • ')} · {s.address}</p>
          <div className="header-stats">
            <span className="rating">★ {s.rating.toFixed(1)}</span>
            <span>{s.deliveryTimeMins} min</span>
            <span>{Number(s.deliveryFee) === 0 ? 'Free delivery' : `${formatPrice(s.deliveryFee)} delivery`}</span>
            <span>Min order {formatPrice(s.minOrderAmount)}</span>
          </div>
        </div>
      </div>

      {!s.open && <div className="alert warn">This parlour is currently closed. You can browse the menu but can't order.</div>}

      <div className="chips">
        {categories.map((c) => (
          <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="menu">
        {visible.map((item) => (
          <div key={item.id} className={`menu-item ${item.available ? '' : 'unavailable'}`}>
            <div className="menu-info">
              <div className="menu-badges">
                <span className={`veg-dot ${item.veg ? 'veg' : 'nonveg'}`} title={item.veg ? 'Veg' : 'Non-veg'} />
                {item.bestseller && <span className="bestseller">★ Bestseller</span>}
              </div>
              <h3>{item.name}</h3>
              <p className="price">{formatPrice(item.price)}</p>
              <p className="muted small">{item.description}</p>
              {!item.available && <p className="small error-text">Currently unavailable</p>}
            </div>
            <div className="menu-thumb">
              <ProductImage
                src={item.imageUrl}
                emoji={iceCreamEmoji(item.category)}
                alt={item.name}
                className="thumb"
                style={{ background: supplierGradient(item.id) }}
              />
              <QuantityControl
                quantity={cart.supplier?.id === s.id ? quantityOf(item.id) : 0}
                onAdd={() => handleAdd(item)}
                onRemove={() => decrement(item.id)}
                disabled={!s.open || !item.available}
              />
            </div>
          </div>
        ))}
      </div>

      {count > 0 && cart.supplier?.id === s.id && (
        <Link to="/cart" className="cart-bar">
          <span>{count} item{count > 1 ? 's' : ''} · {formatPrice(itemsTotal)}</span>
          <span>View cart →</span>
        </Link>
      )}

      {pendingItem && (
        <div className="modal-backdrop" onClick={() => setPendingItem(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Replace cart items?</h3>
            <p>
              Your cart has items from <b>{cart.supplier.name}</b>. Do you want to discard them and add items from{' '}
              <b>{s.name}</b>?
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setPendingItem(null)}>No</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  add(s, pendingItem);
                  setPendingItem(null);
                }}
              >
                Yes, start fresh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
