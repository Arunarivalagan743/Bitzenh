import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('');
  const searchInputRef = useRef(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  const performSearch = () => {
    if (!searchTerm.trim() && !selectedLevel) return;
    
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('q', searchTerm.trim());
    if (selectedLevel) params.append('level', selectedLevel);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    console.log('Navbar search navigating to:', `/search${query}`);
    navigate(`/search${query}`);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Auto-search as user types with debouncing
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.append('q', value.trim());
      if (selectedLevel) params.append('level', selectedLevel);
      
      const query = params.toString() ? `?${params.toString()}` : '';
      navigate(`/search${query}`);
    }, 300);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedLevel('');
    setShowQuickFilters(false);
    searchInputRef.current?.focus();
  };

  const handleQuickLevelFilter = (level) => {
    setSelectedLevel(level);
    
    // Immediately search when level filter changes
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('q', searchTerm.trim());
    if (level) params.append('level', level);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    navigate(`/search${query}`);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          PortalSahooh
        </Link>
        
        <div className="nav-search-section">
          <div className="search-form">
            <div className="search-input-group">
              <FiSearch className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search questions, explanations, code..."
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                className="nav-search-input"
              />
              {(searchTerm || selectedLevel) && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={clearSearch}
                  title="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
            
            <button
              type="button"
              className={`quick-filter-btn ${showQuickFilters ? 'active' : ''}`}
              onClick={() => setShowQuickFilters(!showQuickFilters)}
              title="Quick filters"
            >
              <FiFilter />
              {selectedLevel && <span className="filter-indicator"></span>}
            </button>
            
          </div>
          
          {showQuickFilters && (
            <div className="quick-filters-dropdown">
              <div className="filter-group">
                <label>Quick Level Filter:</label>
                <div className="level-filters">
                  <button
                    type="button"
                    className={`level-filter-btn ${selectedLevel === '' ? 'active' : ''}`}
                    onClick={() => handleQuickLevelFilter('')}
                  >
                    All
                  </button>
                  {[1, 2, 3, 4].map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`level-filter-btn ${selectedLevel === level.toString() ? 'active' : ''}`}
                      onClick={() => handleQuickLevelFilter(level.toString())}
                    >
                      L{level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="advanced-search-link">
                <Link to="/search" onClick={() => setShowQuickFilters(false)}>
                  Advanced Search & Filters
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/level/1" className="nav-link">
            Level 1
          </Link>
          <Link to="/level/2" className="nav-link">
            Level 2
          </Link>
          <Link to="/level/3" className="nav-link">
            Level 3
          </Link>
          <Link to="/level/4" className="nav-link">
            Level 4
          </Link>
          <Link to="/add-question" className="nav-link add-question-btn">
            Add Question
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;