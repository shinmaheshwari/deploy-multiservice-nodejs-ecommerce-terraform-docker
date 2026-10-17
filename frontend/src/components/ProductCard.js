import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    
    if (!user) {
      alert('Please login to add items to cart');
      return;
    }

    const result = await addToCart(product._id, 1);
    if (result.success) {
      alert('Item added to cart!');
    } else {
      alert(result.error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="card">
      <Link to={`/products/${product._id}`}>
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0].url} 
            alt={product.images[0].alt || product.name}
            className="card-img"
          />
        ) : (
          <div 
            className="card-img" 
            style={{ 
              backgroundColor: '#f8f9fa', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#6c757d'
            }}
          >
            No Image
          </div>
        )}
      </Link>
      
      <div className="card-body">
        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="card-title">{product.name}</h3>
        </Link>
        
        <p className="card-text">
          {product.description.length > 100 
            ? product.description.substring(0, 100) + '...'
            : product.description
          }
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="card-price">{formatPrice(product.price)}</span>
          
          {product.inventory.stock > 0 ? (
            <button 
              onClick={handleAddToCart}
              className="btn btn-primary"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              Add to Cart
            </button>
          ) : (
            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
              Out of Stock
            </span>
          )}
        </div>
        
        <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#6c757d' }}>
          <span>Stock: {product.inventory.stock}</span>
          {product.ratings.count > 0 && (
            <span style={{ marginLeft: '1rem' }}>
              ⭐ {product.ratings.average.toFixed(1)} ({product.ratings.count})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;