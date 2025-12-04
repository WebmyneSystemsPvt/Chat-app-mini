import React from 'react';

const SearchBar = React.memo(function SearchBar({ 
  searchInputRef, 
  searchQuery, 
  setSearchQuery, 
  onSearch, 
  searchResults, 
  currentSearchIndex, 
  onNavigateUp, 
  onNavigateDown, 
  onClose 
}) {
  return (
    <div className="search-bar-container">
      <div className="search-bar-controls">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          placeholder="Search messages..."
          className="search-bar-input"
        />
        <button
          onClick={onSearch}
          className="search-bar-search-btn"
        >
          Search
        </button>
        {searchResults.length > 0 && (
          <div className="search-bar-results">
            <button
              onClick={onNavigateUp}
              className="search-bar-nav-btn"
            >
              ↑
            </button>
            <span className="search-bar-count">
              {currentSearchIndex + 1}/{searchResults.length}
            </span>
            <button
              onClick={onNavigateDown}
              className="search-bar-nav-btn"
            >
              ↓
            </button>
          </div>
        )}
        <button
          onClick={onClose}
          className="search-bar-close-btn"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

);

export default SearchBar;