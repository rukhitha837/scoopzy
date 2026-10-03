import { useEffect, useState } from 'react';
import { api } from '../api.js';
import SupplierCard from '../components/SupplierCard.jsx';

const QUICK_FILTERS = ['Kulfi', 'Gelato', 'Chocolate', 'Vegan', 'Sundae', 'Mango', 'Cone'];

export default function Home() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('rating');
  const [cities, setCities] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.cities().then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.suppliers({ q: debounced, city, sort })
      .then((data) => active && (setSuppliers(data), setError('')))
      .catch((e) => active && setError(e.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [debounced, city, sort]);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <h1>Scoopzy</h1>
          <p>Ice cream from the best parlours in your city, delivered cold.</p>
          <div className="search-bar">
            <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City">
              <option value="">📍 All cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="search"
              placeholder="Search for a parlour, flavour or dessert…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="container page">
        <div className="chips">
          {QUICK_FILTERS.map((f) => (
            <button
              key={f}
              className={`chip ${query.toLowerCase() === f.toLowerCase() ? 'active' : ''}`}
              onClick={() => setQuery(query.toLowerCase() === f.toLowerCase() ? '' : f)}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="row-between section-head">
          <h2>{city ? `Ice cream parlours in ${city}` : 'Ice cream parlours near you'}</h2>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="select-sm" aria-label="Sort">
            <option value="rating">Sort: Rating</option>
            <option value="delivery">Sort: Delivery time</option>
            <option value="fee">Sort: Delivery fee</option>
          </select>
        </div>

        {error && <div className="alert error">{error}</div>}
        {loading && !suppliers.length ? (
          <p className="muted">Loading parlours…</p>
        ) : suppliers.length === 0 && !error ? (
          <div className="empty">
            <span className="empty-emoji">🫠</span>
            <p>No parlours match your search.</p>
          </div>
        ) : (
          <div className="grid">
            {suppliers.map((s) => <SupplierCard key={s.id} supplier={s} />)}
          </div>
        )}
      </div>
    </>
  );
}
