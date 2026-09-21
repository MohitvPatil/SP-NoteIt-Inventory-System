import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ searchQuery, onSearchChange, totalCount, filteredCount }) {
  return (
    <div className="controls-bar">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={17} />
        <input
          type="text"
          id="product-search-input"
          className="search-input"
          placeholder="Search by Product ID, Name, or Category..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onSearchChange('')}
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="item-counter-badge">
        {searchQuery ? (
          <span>Showing <strong>{filteredCount}</strong> of {totalCount} products</span>
        ) : (
          <span>Total: <strong>{totalCount}</strong> products</span>
        )}
      </div>
    </div>
  );
}
