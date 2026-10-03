import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import ImageUploadField from '../components/ImageUploadField.jsx';
import ProductImage from '../components/ProductImage.jsx';
import { formatDate, formatPrice, iceCreamEmoji, statusLabel } from '../utils.js';

const STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export default function Admin() {
  const [tab, setTab] = useState('orders');
  return (
    <div className="container page">
      <h1>Admin dashboard</h1>
      <div className="tabs">
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
        <button className={tab === 'suppliers' ? 'active' : ''} onClick={() => setTab('suppliers')}>Suppliers & menus</button>
      </div>
      {tab === 'orders' ? <OrdersAdmin /> : <SuppliersAdmin />}
    </div>
  );
}

// ---------------- Orders ----------------

function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ACTIVE');
  const [error, setError] = useState('');

  const load = useCallback(() => api.admin.orders().then(setOrders).catch((e) => setError(e.message)), []);
  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const changeStatus = async (id, status) => {
    try {
      const updated = await api.admin.updateOrderStatus(id, status);
      setOrders((os) => os.map((o) => (o.id === id ? updated : o)));
    } catch (e) {
      setError(e.message);
    }
  };

  const visible = orders.filter((o) =>
    filter === 'ALL' ? true : filter === 'ACTIVE' ? !['DELIVERED', 'CANCELLED'].includes(o.status) : o.status === filter
  );
  const revenue = orders.filter((o) => o.status === 'DELIVERED').reduce((n, o) => n + Number(o.grandTotal), 0);

  return (
    <>
      <div className="stats">
        <div className="stat"><span>{orders.length}</span>Total orders</div>
        <div className="stat"><span>{orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status)).length}</span>Active</div>
        <div className="stat"><span>{formatPrice(revenue)}</span>Delivered revenue</div>
      </div>
      <div className="row-between section-head">
        <h3>Orders</h3>
        <select className="select-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="ACTIVE">Active</option>
          <option value="ALL">All</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
        </select>
      </div>
      {error && <div className="alert error">{error}</div>}
      {visible.length === 0 ? (
        <p className="muted">No orders here.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr><th>#</th><th>Placed</th><th>Customer</th><th>Parlour</th><th>Items</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {visible.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td className="nowrap">{formatDate(o.createdAt)}</td>
                  <td>{o.customerName}<br /><span className="muted small">{o.deliveryAddress}</span></td>
                  <td>{o.supplierName}</td>
                  <td className="small">{o.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}</td>
                  <td className="nowrap">{formatPrice(o.grandTotal)}</td>
                  <td>
                    {['DELIVERED', 'CANCELLED'].includes(o.status) ? (
                      <span className={`status status-${o.status}`}>{statusLabel(o.status)}</span>
                    ) : (
                      <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ---------------- Suppliers & menu ----------------

const emptySupplier = {
  name: '', description: '', imageUrl: '', tags: '', address: '', city: '',
  rating: 4.0, deliveryTimeMins: 30, deliveryFee: 30, minOrderAmount: 99, open: true,
};

const emptyItem = {
  name: '', description: '', category: 'Cup', price: '', imageUrl: '', veg: true, available: true, bestseller: false,
};

const toSupplierRequest = (s) => ({
  ...s,
  tags: Array.isArray(s.tags) ? s.tags.join(', ') : s.tags,
  rating: Number(s.rating),
  deliveryTimeMins: Number(s.deliveryTimeMins),
  deliveryFee: Number(s.deliveryFee),
  minOrderAmount: Number(s.minOrderAmount),
});

function SuppliersAdmin() {
  const [suppliers, setSuppliers] = useState([]);
  const [editing, setEditing] = useState(null); // supplier form state or null
  const [menuFor, setMenuFor] = useState(null); // supplier id
  const [error, setError] = useState('');

  const load = useCallback(() => api.suppliers().then(setSuppliers).catch((e) => setError(e.message)), []);
  useEffect(() => {
    load();
  }, [load]);

  const save = async (form) => {
    const body = toSupplierRequest(form);
    if (form.id) await api.admin.updateSupplier(form.id, body);
    else await api.admin.createSupplier(body);
    setEditing(null);
    load();
  };

  const toggleOpen = async (s) => {
    try {
      await api.admin.updateSupplier(s.id, toSupplierRequest({ ...s, open: !s.open }));
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (s) => {
    if (!confirm(`Delete ${s.name}?`)) return;
    try {
      await api.admin.deleteSupplier(s.id);
      if (menuFor === s.id) setMenuFor(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <div className="row-between section-head">
        <h3>Suppliers</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing(emptySupplier)}>+ Add supplier</button>
      </div>
      {error && <div className="alert error" onClick={() => setError('')}>{error}</div>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>City</th><th>Rating</th><th>Delivery</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className={menuFor === s.id ? 'selected' : ''}>
                <td>{s.name}<br /><span className="muted small">{s.tags.join(', ')}</span></td>
                <td>{s.city}</td>
                <td>★ {s.rating.toFixed(1)}</td>
                <td className="nowrap">{s.deliveryTimeMins} min · {formatPrice(s.deliveryFee)}</td>
                <td>
                  <button className={`chip ${s.open ? 'active' : ''}`} onClick={() => toggleOpen(s)}>
                    {s.open ? 'Open' : 'Closed'}
                  </button>
                </td>
                <td className="actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setMenuFor(s.id)}>Menu</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...s, tags: s.tags.join(', ') })}>Edit</button>
                  <button className="btn btn-ghost btn-sm danger" onClick={() => remove(s)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {menuFor && <MenuAdmin supplierId={menuFor} />}
      {editing && <SupplierForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}
    </>
  );
}

function SupplierForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const set = (field, value) => setForm({ ...form, [field]: value });
  const input = (field, props = {}) => (
    <input value={form[field] ?? ''} onChange={(e) => set(field, e.target.value)} {...props} />
  );

  const submit = async (e) => {
    e.preventDefault();
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal wide" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{form.id ? 'Edit supplier' : 'New supplier'}</h3>
        <div className="form-grid">
          <label>Name{input('name', { required: true })}</label>
          <label>City{input('city', { required: true })}</label>
          <label className="span-2">Description<textarea rows={2} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} /></label>
          <label>Area / address{input('address')}</label>
          <label>Tags (comma-separated){input('tags')}</label>
          <label>Rating (0-5){input('rating', { type: 'number', step: '0.1', min: 0, max: 5 })}</label>
          <label>Delivery time (min){input('deliveryTimeMins', { type: 'number', min: 0 })}</label>
          <label>Delivery fee (₹){input('deliveryFee', { type: 'number', min: 0, required: true })}</label>
          <label>Min order (₹){input('minOrderAmount', { type: 'number', min: 0, required: true })}</label>
          <ImageUploadField value={form.imageUrl} onChange={(url) => set('imageUrl', url)} emoji="🏪" />
          <label className="radio"><input type="checkbox" checked={form.open} onChange={(e) => set('open', e.target.checked)} /> Open for orders</label>
        </div>
        {error && <div className="alert error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
}

function MenuAdmin({ supplierId }) {
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => api.supplier(supplierId).then(setData).catch((e) => setError(e.message)), [supplierId]);
  useEffect(() => {
    load();
  }, [load]);

  const save = async (form) => {
    const body = { ...form, price: Number(form.price) };
    if (form.id) await api.admin.updateIceCream(form.id, body);
    else await api.admin.addIceCream(supplierId, body);
    setEditing(null);
    load();
  };

  const toggle = async (item, field) => {
    try {
      await api.admin.updateIceCream(item.id, { ...item, [field]: !item[field] });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  const remove = async (item) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    try {
      await api.admin.deleteIceCream(item.id);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  if (!data) return null;

  return (
    <div className="card menu-admin">
      <div className="row-between">
        <h3>Menu · {data.supplier.name}</h3>
        <button className="btn btn-primary btn-sm" onClick={() => setEditing(emptyItem)}>+ Add ice cream</button>
      </div>
      {error && <div className="alert error">{error}</div>}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Available</th><th>Bestseller</th><th></th></tr>
          </thead>
          <tbody>
            {data.menu.map((i) => (
              <tr key={i.id}>
                <td><ProductImage src={i.imageUrl} emoji={iceCreamEmoji(i.category)} alt={i.name} className="table-thumb" /></td>
                <td>{i.name}<br /><span className="muted small">{i.description}</span></td>
                <td>{i.category}</td>
                <td>{formatPrice(i.price)}</td>
                <td><input type="checkbox" checked={i.available} onChange={() => toggle(i, 'available')} /></td>
                <td><input type="checkbox" checked={i.bestseller} onChange={() => toggle(i, 'bestseller')} /></td>
                <td className="actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(i)}>Edit</button>
                  <button className="btn btn-ghost btn-sm danger" onClick={() => remove(i)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <IceCreamForm initial={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function IceCreamForm({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const set = (field, value) => setForm({ ...form, [field]: value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal wide" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h3>{form.id ? 'Edit ice cream' : 'New ice cream'}</h3>
        <div className="form-grid">
          <label>Name<input required value={form.name} onChange={(e) => set('name', e.target.value)} /></label>
          <label>
            Category
            <select value={form.category ?? ''} onChange={(e) => set('category', e.target.value)}>
              {['Cup', 'Cone', 'Tub', 'Kulfi', 'Sundae', 'Gelato', 'Stick'].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Price (₹)<input type="number" min="1" step="0.01" required value={form.price} onChange={(e) => set('price', e.target.value)} /></label>
          <label className="span-2">Description<textarea rows={2} value={form.description ?? ''} onChange={(e) => set('description', e.target.value)} /></label>
          <ImageUploadField value={form.imageUrl} onChange={(url) => set('imageUrl', url)} emoji={iceCreamEmoji(form.category)} />
          <label className="radio"><input type="checkbox" checked={form.veg} onChange={(e) => set('veg', e.target.checked)} /> Vegetarian</label>
          <label className="radio"><input type="checkbox" checked={form.available} onChange={(e) => set('available', e.target.checked)} /> Available</label>
          <label className="radio"><input type="checkbox" checked={form.bestseller} onChange={(e) => set('bestseller', e.target.checked)} /> Bestseller</label>
        </div>
        {error && <div className="alert error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary">Save</button>
        </div>
      </form>
    </div>
  );
}
