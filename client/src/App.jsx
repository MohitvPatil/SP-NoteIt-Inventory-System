import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ProductTable from './components/ProductTable';
import ProductModal from './components/ProductModal';
import DeleteModal from './components/DeleteModal';
import Toast from './components/Toast';

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Toast State
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check DB health
  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setDbConnected(data.database === 'connected');
      } else {
        setDbConnected(false);
      }
    } catch {
      setDbConnected(false);
    }
  }, []);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        addToast(data.message || 'Failed to load products', 'error');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      addToast('Cannot connect to server. Ensure backend is running.', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    checkHealth();
    fetchProducts();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, [checkHealth, fetchProducts]);

  // Keyboard shortcut: Press / to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchInput = document.getElementById('product-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Add / Edit Product Submit
  const handleProductSubmit = async (formData) => {
    if (editingProduct) {
      // Update
      const res = await fetch(`/api/products/${editingProduct.product_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update product');
      }
      setProducts((prev) =>
        prev.map((p) => (p.product_id === editingProduct.product_id ? data.data : p))
      );
      addToast(`Updated product "${formData.product_name}"`, 'success');
    } else {
      // Create
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create product');
      }
      setProducts((prev) => [data.data, ...prev]);
      addToast(`Created product "${formData.product_name}" (${data.data.product_id})`, 'success');
    }
  };

  // Delete Product
  const handleConfirmDelete = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete product');
      }
      setProducts((prev) => prev.filter((p) => p.product_id !== productId));
      addToast(`Deleted product "${productId}" from database`, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
      throw err;
    }
  };

  // Open Modals
  const openAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Filtered Products (instant client search for speed)
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const idMatch = p.product_id && p.product_id.toLowerCase().includes(q);
      const nameMatch = p.product_name && p.product_name.toLowerCase().includes(q);
      const catMatch = p.category && p.category.toLowerCase().includes(q);
      return idMatch || nameMatch || catMatch;
    });
  }, [products, searchQuery]);

  return (
    <div className="app-container">
      <Header
        dbConnected={dbConnected}
        onOpenAddModal={openAddModal}
      />

      <main className="main-content">
        <section className="page-intro">
          <div>
            <h1 className="page-title">Product Catalog</h1>
            <p className="page-subtitle">
              Manage inventory, search items, and sync records directly with MySQL.
            </p>
          </div>
        </section>

        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalCount={products.length}
          filteredCount={filteredProducts.length}
        />

        <ProductTable
          products={filteredProducts}
          loading={loading}
          searchQuery={searchQuery}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onOpenAddModal={openAddModal}
          onClearSearch={() => setSearchQuery('')}
        />
      </main>

      <footer className="app-footer">
        <div className="footer-inner">
          <span>Product Management System &bull; Minimalist UI</span>
          <span>Powered by React + Express + MySQL 8.0</span>
        </div>
      </footer>

      {/* Modals & Feedback */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSubmit={handleProductSubmit}
        initialData={editingProduct}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        product={productToDelete}
      />

      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
