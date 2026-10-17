import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { user } = useAuth();
  const { cart, loading, updateCartItem, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeFromCart(productId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      await clearCart();
    }
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h1>Your Cart</h1>
        <p>Please log in to view your cart.</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h1>Your Cart</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Your cart is empty</p>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Your Cart ({cart.totalItems} items)</h1>
        <button onClick={handleClearCart} className="btn btn-secondary">
          Clear Cart
        </button>
      </div>

      <div className="grid grid-2" style={{ gap: '3rem' }}>
        {/* Cart Items */}
        <div>
          <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden' }}>
            {cart.items.map((item, index) => (
              <div 
                key={item.productId}
                style={{ 
                  padding: '1.5rem',
                  borderBottom: index < cart.items.length - 1 ? '1px solid #e9ecef' : 'none',
                  display: 'flex',
                  gap: '1rem'
                }}
              >
                {/* Product Image */}
                <div>
                  {item.productDetails.image ? (
                    <img
                      src={item.productDetails.image}
                      alt={item.productDetails.name}
                      style={{
                        width: '100px',
                        height: '100px',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100px',
                      height: '100px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#6c757d'
                    }}>
                      No Image
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    <Link 
                      to={`/products/${item.productId}`}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      {item.productDetails.name}
                    </Link>
                  </h3>
                  
                  <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
                    SKU: {item.productDetails.sku}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Quantity Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="btn btn-secondary"
                        style={{ width: '30px', height: '30px', padding: '0', fontSize: '1.2rem' }}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      
                      <span style={{ 
                        minWidth: '40px', 
                        textAlign: 'center',
                        fontSize: '1.1rem',
                        fontWeight: 'bold'
                      }}>
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="btn btn-secondary"
                        style={{ width: '30px', height: '30px', padding: '0', fontSize: '1.2rem' }}
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                        {formatPrice(item.price)} each
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="btn btn-secondary"
                      style={{ padding: '0.5rem', color: '#dc3545' }}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '2rem', 
            borderRadius: '10px',
            position: 'sticky',
            top: '2rem'
          }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Order Summary</h2>
            
            <div style={{ borderBottom: '1px solid #e9ecef', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>{formatPrice(cart.totalPrice)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Shipping</span>
                <span style={{ color: '#28a745' }}>
                  {cart.totalPrice > 50 ? 'FREE' : formatPrice(9.99)}
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Tax (estimated)</span>
                <span>{formatPrice(cart.totalPrice * 0.08)}</span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '1.2rem', 
              fontWeight: 'bold',
              marginBottom: '2rem'
            }}>
              <span>Total</span>
              <span>
                {formatPrice(
                  cart.totalPrice + 
                  (cart.totalPrice > 50 ? 0 : 9.99) + 
                  (cart.totalPrice * 0.08)
                )}
              </span>
            </div>

            {cart.totalPrice <= 50 && (
              <div style={{ 
                backgroundColor: '#fff3cd', 
                color: '#856404',
                padding: '0.75rem',
                borderRadius: '5px',
                marginBottom: '1rem',
                fontSize: '0.9rem'
              }}>
                Add {formatPrice(50 - cart.totalPrice)} more for free shipping!
              </div>
            )}

            <button 
              onClick={handleCheckout}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}
            >
              Proceed to Checkout
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link 
                to="/products" 
                style={{ color: '#007bff', textDecoration: 'none' }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;