import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/api';

const Orders = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  const { data: ordersData, isLoading, error } = useQuery(
    ['orders', user?._id],
    () => orderService.getUserOrders(user._id),
    {
      select: (response) => response.data,
      enabled: !!user
    }
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#007bff',
      processing: '#6f42c1',
      shipped: '#fd7e14',
      delivered: '#28a745',
      cancelled: '#dc3545',
      refunded: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded'
    };
    return texts[status] || status;
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '3rem 0', textAlign: 'center' }}>
        <h1>Your Orders</h1>
        <p>Please log in to view your orders.</p>
        <Link to="/login" className="btn btn-primary">Login</Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="error">
          Error loading orders: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Your Orders</h1>

      {success && orderId && (
        <div className="success" style={{ marginBottom: '2rem' }}>
          <h3>Order Placed Successfully! 🎉</h3>
          <p>Your order has been placed and will be processed shortly. Order ID: {orderId}</p>
        </div>
      )}

      {!ordersData?.orders || ordersData.orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <h3>No Orders Found</h3>
          <p style={{ marginBottom: '2rem' }}>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {ordersData.orders.map(order => (
            <div 
              key={order._id}
              style={{ 
                backgroundColor: 'white', 
                borderRadius: '10px', 
                padding: '2rem',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              {/* Order Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>
                    Order #{order.orderNumber}
                  </h3>
                  <p style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                    Placed on {formatDate(order.createdAt)}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span 
                      style={{ 
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '15px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <span 
                      style={{ 
                        backgroundColor: getStatusColor(order.paymentStatus),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '15px',
                        fontSize: '0.875rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Payment Pending'}
                    </span>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                    {formatPrice(order.pricing.total)}
                  </div>
                  <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ 
                borderTop: '1px solid #e9ecef', 
                borderBottom: '1px solid #e9ecef',
                padding: '1rem 0',
                marginBottom: '1rem'
              }}>
                <h4 style={{ marginBottom: '1rem' }}>Items Ordered</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {order.items.map(item => (
                    <div 
                      key={item.productId}
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          {item.productDetails.name}
                        </div>
                        <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                          SKU: {item.productDetails.sku} • Qty: {item.quantity}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold' }}>
                          {formatPrice(item.total)}
                        </div>
                        <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                          {formatPrice(item.price)} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Tracking */}
              <div className="grid grid-2" style={{ gap: '2rem' }}>
                <div>
                  <h4 style={{ marginBottom: '1rem' }}>Shipping Address</h4>
                  <div style={{ color: '#6c757d' }}>
                    <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
                  </div>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '1rem' }}>Delivery Info</h4>
                  <div style={{ color: '#6c757d' }}>
                    <p><strong>Method:</strong> {order.shipping.method}</p>
                    {order.shipping.trackingNumber && (
                      <p><strong>Tracking:</strong> {order.shipping.trackingNumber}</p>
                    )}
                    {order.shipping.carrier && (
                      <p><strong>Carrier:</strong> {order.shipping.carrier}</p>
                    )}
                    {order.shipping.estimatedDelivery && (
                      <p><strong>Estimated Delivery:</strong> {formatDate(order.shipping.estimatedDelivery)}</p>
                    )}
                    {order.shipping.deliveredAt && (
                      <p style={{ color: '#28a745', fontWeight: 'bold' }}>
                        <strong>Delivered:</strong> {formatDate(order.shipping.deliveredAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Actions */}
              <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid #e9ecef',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <Link 
                  to={`/orders/${order._id}`}
                  className="btn btn-outline"
                >
                  View Details
                </Link>
                
                {order.status === 'pending' && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel this order?')) {
                        // Handle order cancellation
                        console.log('Cancel order:', order._id);
                      }
                    }}
                  >
                    Cancel Order
                  </button>
                )}
                
                {order.status === 'delivered' && (
                  <button className="btn btn-outline">
                    Reorder Items
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;