import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productService } from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => productService.getProduct(id),
    {
      select: (response) => response.data,
      onError: () => navigate('/products')
    }
  );

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    const result = await addToCart(product._id, quantity);
    if (result.success) {
      alert(`${quantity} item(s) added to cart!`);
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

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="error">
          Product not found
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <button 
        onClick={() => navigate('/products')} 
        className="btn btn-secondary"
        style={{ marginBottom: '2rem' }}
      >
        ← Back to Products
      </button>

      <div className="grid grid-2" style={{ gap: '3rem' }}>
        {/* Product Images */}
        <div>
          {product.images && product.images.length > 0 ? (
            <div>
              <img 
                src={product.images[selectedImage]?.url} 
                alt={product.images[selectedImage]?.alt || product.name}
                style={{ 
                  width: '100%', 
                  height: '400px', 
                  objectFit: 'cover',
                  borderRadius: '10px',
                  marginBottom: '1rem'
                }}
              />
              
              {product.images.length > 1 && (
                <div style={{ display: 'flex', gap: '0.5rem', overflow: 'auto' }}>
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={image.alt || `${product.name} ${index + 1}`}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: selectedImage === index ? '2px solid #007bff' : '2px solid transparent'
                      }}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ 
              width: '100%', 
              height: '400px', 
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              color: '#6c757d',
              fontSize: '2rem'
            }}>
              No Image Available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            {product.name}
          </h1>
          
          <p style={{ color: '#6c757d', marginBottom: '1rem' }}>
            Brand: {product.brand}
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            {product.ratings.count > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.2rem' }}>
                  ⭐ {product.ratings.average.toFixed(1)}
                </span>
                <span style={{ color: '#6c757d' }}>
                  ({product.ratings.count} reviews)
                </span>
              </div>
            ) : (
              <span style={{ color: '#6c757d' }}>No reviews yet</span>
            )}
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff', marginBottom: '1.5rem' }}>
            {formatPrice(product.price)}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Description</h3>
            <p style={{ lineHeight: '1.6', color: '#666' }}>
              {product.description}
            </p>
          </div>

          {/* Product Specifications */}
          {product.specifications && (
            <div style={{ marginBottom: '2rem' }}>
              <h3>Specifications</h3>
              <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '5px' }}>
                {product.specifications.color && (
                  <p><strong>Color:</strong> {product.specifications.color}</p>
                )}
                {product.specifications.material && (
                  <p><strong>Material:</strong> {product.specifications.material}</p>
                )}
                {product.specifications.weight && (
                  <p><strong>Weight:</strong> {product.specifications.weight}g</p>
                )}
                {product.specifications.dimensions && (
                  <p>
                    <strong>Dimensions:</strong> {' '}
                    {product.specifications.dimensions.length} × {' '}
                    {product.specifications.dimensions.width} × {' '}
                    {product.specifications.dimensions.height} cm
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Stock Info */}
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ color: product.inventory.stock > 0 ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
              {product.inventory.stock > 0 
                ? `${product.inventory.stock} in stock` 
                : 'Out of stock'
              }
            </p>
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              SKU: {product.inventory.sku}
            </p>
          </div>

          {/* Add to Cart */}
          {product.inventory.stock > 0 && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={product.inventory.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="form-control"
                  style={{ width: '80px' }}
                />
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem' }}>&nbsp;</label>
                <button 
                  onClick={handleAddToCart}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '1.1rem', padding: '0.75rem' }}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h4>Tags</h4>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {product.tags.map((tag, index) => (
                  <span 
                    key={index}
                    style={{
                      backgroundColor: '#e9ecef',
                      color: '#495057',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '15px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;