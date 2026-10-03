import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-icon">🍦</span> Scoopzy
        </Link>
        <nav className="nav-links">
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
          {user && <NavLink to="/orders">My Orders</NavLink>}
          <NavLink to="/cart" className="cart-link">
            Cart {count > 0 && <span className="badge">{count}</span>}
          </NavLink>
          {user ? (
            <>
              <NavLink to="/profile" className="nav-user">Hi, {user.name.split(' ')[0]}</NavLink>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
