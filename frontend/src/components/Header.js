import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            E-Commerce
          </Link>

          <nav>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              {user && (
                <>
                  <li><Link to="/orders">Orders</Link></li>
                  <li>
                    <Link to="/cart" style={{ position: 'relative' }}>
                      Cart
                      {getCartItemsCount() > 0 && (
                        <span className="cart-badge">
                          {getCartItemsCount()}
                        </span>
                      )}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          <div className="auth-section">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>Welcome, {user.firstName}!</span>
                <Link to="/profile" className="btn btn-outline">
                  Profile
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary">
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;