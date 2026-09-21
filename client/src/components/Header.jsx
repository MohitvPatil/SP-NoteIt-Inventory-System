import React from 'react';
import { Package, Plus } from 'lucide-react';

export default function Header({ dbConnected, onOpenAddModal }) {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo-group">
          <div className="logo-icon-wrapper">
            <Package size={20} strokeWidth={2.2} />
          </div>
          <div>
            <div className="brand-title">
              ProductHub
              <span className="brand-tag">MySQL</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <div className="status-pill" title={dbConnected ? 'MySQL 8.0 Connected (localhost:3306)' : 'Database Offline'}>
            <span className={`status-dot ${dbConnected ? 'connected' : 'disconnected'}`} />
            <span>{dbConnected ? 'MySQL Connected' : 'DB Offline'}</span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddModal}
            id="open-add-product-btn"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add Product</span>
          </button>
        </div>
      </div>
    </header>
  );
}
