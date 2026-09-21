import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';

const COMMON_CATEGORIES = ['Electronics', 'Audio', 'Displays', 'Accessories', 'Office', 'Hardware', 'Software', 'Other'];

export default function ProductModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const isEdit = Boolean(initialData);

  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [customCategory, setCustomCategory] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setProductId(initialData.product_id || '');
      setProductName(initialData.product_name || '');
      const existingCat = initialData.category || 'General';
      if (COMMON_CATEGORIES.includes(existingCat)) {
        setCategory(existingCat);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(existingCat);
      }
      setPrice(initialData.price !== undefined ? String(initialData.price) : '');
    } else {
      
      setProductId(`PRD-${Math.floor(100 + Math.random() * 900)}`);
      setProductName('');
      setCategory('Electronics');
      setCustomCategory('');
      setPrice('');
    }
    setError('');
    setSubmitting(false);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!productName.trim()) {
      setError('Product Name is required.');
      return;
    }

    if (!isEdit && !productId.trim()) {
      setError('Product ID is required.');
      return;
    }

    const finalCategory = category === 'Other' && customCategory.trim()
      ? customCategory.trim()
      : category;

    setSubmitting(true);
    try {
      await onSubmit({
        product_id: productId.trim(),
        product_name: productName.trim(),
        category: finalCategory,
        price: price !== '' ? parseFloat(price) : 0.00
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--danger)',
                  fontSize: '0.825rem',
                  fontWeight: 500
                }}
              >
                {error}
              </div>
            )}

            {/* Product ID */}
            <div className="form-group">
              <label className="form-label" htmlFor="product-id-input">
                Product ID <span className="req">*</span>
                {isEdit && <span className="opt">(Read-only)</span>}
              </label>
              <input
                type="text"
                id="product-id-input"
                className="form-input font-mono"
                placeholder="e.g. PRD-101"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                disabled={isEdit}
                required
              />
              {!isEdit && (
                <p className="form-hint">Unique identifier for this product (e.g. PRD-101, SKU-092).</p>
              )}
            </div>

            {/* Product Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="product-name-input">
                Product Name <span className="req">*</span>
              </label>
              <input
                type="text"
                id="product-name-input"
                className="form-input"
                placeholder="e.g. Mechanical RGB Gaming Keyboard"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                autoFocus
                required
              />
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="product-category-select">
                Category <span className="opt">(Optional)</span>
              </label>
              <select
                id="product-category-select"
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {category === 'Other' && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Specify custom category..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              )}
            </div>

            {/* Price */}
            <div className="form-group">
              <label className="form-label" htmlFor="product-price-input">
                Price ($) <span className="opt">(Optional)</span>
              </label>
              <input
                type="number"
                id="product-price-input"
                className="form-input font-mono"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              id="submit-product-btn"
            >
              {isEdit ? <Save size={15} /> : <Plus size={15} />}
              <span>{submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
