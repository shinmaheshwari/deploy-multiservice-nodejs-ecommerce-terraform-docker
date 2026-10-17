import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc'
  });

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery(
    ['products', filters],
    () => productService.getProducts(filters),
    {
      select: (response) => response.data,
      keepPreviousData: true
    }
  );

  // Fetch categories for filter
  const { data: categories } = useQuery(
    'categories',
    () => productService.getCategories(),
    {
      select: (response) => response.data
    }
  );

  const updateFilters = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    const defaultFilters = {
      page: 1,
      limit: 12,
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(defaultFilters);
    setSearchParams({});
  };

  if (error) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="error">
          Error loading products: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Products</h1>

      {/* Filters */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '1.5rem', 
        borderRadius: '10px', 
        marginBottom: '2rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
          {/* Search */}
          <div className="form-group">
            <label>Search Products</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or description..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>
            <select
              className="form-control"
              value={filters.category}
              onChange={(e) => updateFilters({ category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories?.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="form-group">
            <label>Min Price</label>
            <input
              type="number"
              className="form-control"
              placeholder="0"
              min="0"
              value={filters.minPrice}
              onChange={(e) => updateFilters({ minPrice: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Max Price</label>
            <input
              type="number"
              className="form-control"
              placeholder="1000"
              min="0"
              value={filters.maxPrice}
              onChange={(e) => updateFilters({ maxPrice: e.target.value })}
            />
          </div>

          {/* Sort By */}
          <div className="form-group">
            <label>Sort By</label>
            <select
              className="form-control"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                updateFilters({ sortBy, sortOrder });
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="ratings.average-desc">Highest Rated</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'end' }}>
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Results Info */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem',
            color: '#6c757d'
          }}>
            <span>
              Showing {productsData?.products?.length || 0} of {productsData?.total || 0} products
            </span>
            <span>
              Page {filters.page} of {productsData?.totalPages || 1}
            </span>
          </div>

          {/* Products Grid */}
          {productsData?.products?.length > 0 ? (
            <div className="grid grid-3">
              {productsData.products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          )}

          {/* Pagination */}
          {productsData?.totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '0.5rem',
              marginTop: '3rem'
            }}>
              <button
                className="btn btn-secondary"
                disabled={filters.page <= 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </button>
              
              {Array.from({ length: productsData.totalPages }, (_, i) => i + 1)
                .filter(page => 
                  page === 1 || 
                  page === productsData.totalPages || 
                  Math.abs(page - filters.page) <= 2
                )
                .map(page => (
                  <button
                    key={page}
                    className={`btn ${page === filters.page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                ))}
              
              <button
                className="btn btn-secondary"
                disabled={filters.page >= productsData.totalPages}
                onClick={() => handlePageChange(filters.page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;