import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import { formatPrice, supplierEmoji, supplierGradient } from '../utils.js';

export default function SupplierCard({ supplier: s }) {
  return (
    <Link to={`/suppliers/${s.id}`} className={`supplier-card ${s.open ? '' : 'closed'}`}>
      <div className="supplier-banner" style={{ background: supplierGradient(s.id) }}>
        <ProductImage src={s.imageUrl} emoji={supplierEmoji(s)} alt={s.name} className="fill" />
        {!s.open && <span className="closed-tag">Currently closed</span>}
      </div>
      <div className="supplier-body">
        <div className="row-between">
          <h3>{s.name}</h3>
          <span className="rating">★ {s.rating.toFixed(1)}</span>
        </div>
        <p className="muted small">{s.tags.join(' • ')}</p>
        <div className="row-between small">
          <span>{s.address}</span>
          <span>{s.deliveryTimeMins} min</span>
        </div>
        <p className="muted small">
          {Number(s.deliveryFee) === 0 ? 'Free delivery' : `${formatPrice(s.deliveryFee)} delivery`} · Min {formatPrice(s.minOrderAmount)}
        </p>
      </div>
    </Link>
  );
}
