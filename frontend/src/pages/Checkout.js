import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/api';

const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    shippingAddress: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      phone: user?.phone || ''
    },
    billingAddress: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      phone: user?.phone || ''
    },
    paymentMethod: 'credit_card',
    shippingMethod: 'standard',
    customerNotes: '',
    sameAsBilling: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSameAsBillingChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      sameAsBilling: checked,
      billingAddress: checked ? { ...prev.shippingAddress } : prev.billingAddress
    }));
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    const shipping = cart.totalPrice > 50 ? 0 : 9.99;
    const tax = cart.totalPrice * 0.08;
    return cart.totalPrice + shipping + tax;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create order
      const orderData = {
        userId: user._id,
        shippingAddress: formData.shippingAddress,
        billingAddress: formData.sameAsBilling ? formData.shippingAddress : formData.billingAddress,
        paymentMethod: formData.paymentMethod,
        shippingMethod: formData.shippingMethod,
        customerNotes: formData.customerNotes
      };

      const orderResponse = await orderService.createOrder(orderData);
      const order = orderResponse.data.order;

      // Process payment
      const paymentData = {
        orderId: order._id,
        paymentMethod: formData.paymentMethod,
        paymentDetails: {
          // In a real app, this would come from a payment form
          cardNumber: '**** **** **** 1234',
          expiryDate: '12/25'
        }
      };

      await orderService.processPayment(paymentData);

      // Clear cart and redirect
      await clearCart();
      navigate(`/orders?success=true&orderId=${order._id}`);

    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>

      {error && (
        <div className="error" style={{ marginBottom: '2rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2" style={{ gap: '3rem' }}>
          {/* Checkout Form */}
          <div>
            {/* Shipping Address */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem', 
              borderRadius: '10px',
              marginBottom: '2rem'
            }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Shipping Address</h2>
              
              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.shippingAddress.firstName}
                    onChange={(e) => handleInputChange('shippingAddress', 'firstName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.shippingAddress.lastName}
                    onChange={(e) => handleInputChange('shippingAddress', 'lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.shippingAddress.street}
                  onChange={(e) => handleInputChange('shippingAddress', 'street', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleInputChange('shippingAddress', 'city', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>State</label>
                  <select
                    className="form-control"
                    value={formData.shippingAddress.state}
                    onChange={(e) => handleInputChange('shippingAddress', 'state', e.target.value)}
                    required
                  >
                    <option value="">Select State</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>ZIP Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.shippingAddress.zipCode}
                    onChange={(e) => handleInputChange('shippingAddress', 'zipCode', e.target.value)}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={formData.shippingAddress.phone}
                    onChange={(e) => handleInputChange('shippingAddress', 'phone', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem', 
              borderRadius: '10px',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2>Billing Address</h2>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.sameAsBilling}
                    onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                  />
                  Same as shipping
                </label>
              </div>

              {!formData.sameAsBilling && (
                <>
                  <div className="grid grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.billingAddress.firstName}
                        onChange={(e) => handleInputChange('billingAddress', 'firstName', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.billingAddress.lastName}
                        onChange={(e) => handleInputChange('billingAddress', 'lastName', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Street Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.billingAddress.street}
                      onChange={(e) => handleInputChange('billingAddress', 'street', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.billingAddress.city}
                        onChange={(e) => handleInputChange('billingAddress', 'city', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>State</label>
                      <select
                        className="form-control"
                        value={formData.billingAddress.state}
                        onChange={(e) => handleInputChange('billingAddress', 'state', e.target.value)}
                        required
                      >
                        <option value="">Select State</option>
                        <option value="CA">California</option>
                        <option value="NY">New York</option>
                        <option value="TX">Texas</option>
                        <option value="FL">Florida</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group">
                      <label>ZIP Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.billingAddress.zipCode}
                        onChange={(e) => handleInputChange('billingAddress', 'zipCode', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={formData.billingAddress.phone}
                        onChange={(e) => handleInputChange('billingAddress', 'phone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment & Shipping */}
            <div style={{ 
              backgroundColor: 'white', 
              padding: '2rem', 
              borderRadius: '10px',
              marginBottom: '2rem'
            }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Payment & Shipping</h2>
              
              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    className="form-control"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    required
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Shipping Method</label>
                  <select
                    className="form-control"
                    value={formData.shippingMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))}
                    required
                  >
                    <option value="standard">Standard (5-7 days) - {cart.totalPrice > 50 ? 'FREE' : '$9.99'}</option>
                    <option value="express">Express (2-3 days) - $19.99</option>
                    <option value="overnight">Overnight - $39.99</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Order Notes (Optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.customerNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerNotes: e.target.value }))}
                  placeholder="Any special instructions for delivery..."
                />
              </div>
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
              
              {/* Order Items */}
              <div style={{ marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                {cart.items.map(item => (
                  <div key={item.productId} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #e9ecef'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{item.productDetails.name}</div>
                      <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                        Qty: {item.quantity} × {formatPrice(item.price)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div style={{ borderTop: '1px solid #e9ecef', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Subtotal</span>
                  <span>{formatPrice(cart.totalPrice)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Shipping</span>
                  <span>{cart.totalPrice > 50 ? 'FREE' : formatPrice(9.99)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span>Tax (estimated)</span>
                  <span>{formatPrice(cart.totalPrice * 0.08)}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold',
                  borderTop: '1px solid #e9ecef',
                  paddingTop: '1rem'
                }}>
                  <span>Total</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>

              <button 
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', marginTop: '2rem' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Place Order - ${formatPrice(calculateTotal())}`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;