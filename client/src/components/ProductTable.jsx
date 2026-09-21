import React from 'react';
import { Edit3, Trash2, PackageOpen, Plus } from 'lucide-react';

export default function ProductTable({
  products,
  loading,
  searchQuery,
  onEdit,
  onDelete,
  onOpenAddModal,
  onClearSearch
}) {
  if (loading) {
    return (
      <div className="table-card">
        <div className="loading-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading catalog from MySQL...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <div className="empty-icon-wrapper">
            <PackageOpen size={28} />
          </div>
          <h3 className="empty-title">
            {searchQuery ? 'No matching products found' : 'No products in database yet'}
          </h3>
          <p className="empty-desc">
            {searchQuery
              ? `We couldn't find any products matching "${searchQuery}". Try searching for another keyword or clear the filter.`
              : 'Your product catalog is currently empty. Click "Add First Product" to create your first item.'}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {searchQuery ? (
              <button type="button" className="btn btn-secondary" onClick={onClearSearch}>
                Clear Search Filter
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={onOpenAddModal} id="add-first-product-btn">
                <Plus size={16} />
                Add First Product
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (val) => {
    const num = parseFloat(val);
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="product-table">
          <thead>
            <tr>
              <th style={{ width: '130px' }}>Product ID</th>
              <th>Product Name</th>
              <th style={{ width: '140px' }}>Category</th>
              <th style={{ width: '110px' }}>Price</th>
              <th style={{ width: '130px' }}>Date Added</th>
              <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.product_id} id={`product-row-${product.product_id}`}>
                <td>
                  <span className="product-id-badge" title="Unique Product ID">
                    {product.product_id}
                  </span>
                </td>
                <td>
                  <span className="product-name-text">{product.product_name}</span>
                </td>
                <td>
                  <span className="category-tag">{product.category || 'General'}</span>
                </td>
                <td>
                  <span className="price-text">{formatPrice(product.price)}</span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {formatDate(product.created_at)}
                  </span>
                </td>
                <td>
                  <div className="actions-cell">
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      onClick={() => onEdit(product)}
                      title={`Edit ${product.product_name}`}
                      aria-label={`Edit ${product.product_name}`}
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => onDelete(product)}
                      title={`Delete ${product.product_name}`}
                      aria-label={`Delete ${product.product_name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
