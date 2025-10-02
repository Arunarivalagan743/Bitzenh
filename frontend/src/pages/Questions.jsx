import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import './Questions.css';
import { apiFetch } from '../api/client';

const Questions = () => {
  const { level } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchLanguages();
  }, []);

  // Clear search and filters when level changes
  useEffect(() => {
    setSearchTerm('');
    setSelectedLanguage('');
    setError(null);
  }, [level]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchQuestions();
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [level, searchTerm, selectedLanguage]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      if (selectedLanguage) params.append('language', selectedLanguage);
      const query = params.toString() ? `?${params.toString()}` : '';

      const data = await apiFetch(`/questions/level/${level}${query}`);
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message || 'Failed to load questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async () => {
    try {
      const languages = await apiFetch('/questions/languages');
      if (Array.isArray(languages)) setAvailableLanguages(languages);
    } catch (err) {
      console.error('Failed to fetch languages:', err);
    }
  };

  const handleSearchChange = (e) => {
    e.preventDefault();
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      // Optionally trigger search immediately
      fetchQuestions();
    }
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    // Maintain focus on search input
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLanguage('');
    // Keep focus on search input after clearing
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

  const getLevelTitle = (level) => {
    const levels = {
      1: 'Basic Programming',
      2: 'Intermediate Programming', 
      3: 'Advanced Programming',
      4: 'Expert Programming'
    };
    return levels[level] || 'Programming Questions';
  };

  const getLevelDescription = (level) => {
    const descriptions = {
      1: 'Master the fundamentals of programming with basic syntax and concepts.',
      2: 'Learn about loops, conditions, and function-based programming.',
      3: 'Dive into data structures, algorithms, and efficient problem solving.',
      4: 'Challenge yourself with complex algorithms and advanced programming concepts.'
    };
    return descriptions[level] || 'Programming questions for your skill level.';
  };

  if (loading) {
    return (
      <div className="questions-page">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="questions-page">
        <div className="error">
          <h2>Error loading questions</h2>
          <p>{error}</p>
          <button onClick={fetchQuestions}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="questions-page">
      <div className="questions-header">
        <h1>Level {level}: {getLevelTitle(level)}</h1>
        <p>{getLevelDescription(level)}</p>
        <div className="questions-count">
          {questions.length} {questions.length === 1 ? 'Question' : 'Questions'} Available
        </div>
      </div>

      <div className="search-filter-container">
        <div className="search-input-container">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search questions instantly..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            className="search-input"
            autoComplete="off"
            onFocus={() => {
              // Ensure the input stays focused
              if (searchInputRef.current) {
                searchInputRef.current.setSelectionRange(searchTerm.length, searchTerm.length);
              }
            }}
          />
          {searchTerm && (
            <button 
              className="clear-search-btn"
              onClick={handleClearSearch}
              type="button"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="filter-group">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="language-filter"
          >
            <option value="">All Languages</option>
            {availableLanguages.map(lang => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
          
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="questions-container">
        {questions.length === 0 ? (
          <div className="no-questions">
            <h3>No questions available for this level yet.</h3>
            <p>Be the first to add a question for Level {level}!</p>
          </div>
        ) : (
          <div className="questions-grid">
            {questions.map((question) => (
              <QuestionCard
                key={question._id}
                question={question}
                onUpdated={fetchQuestions}
                onDeleted={fetchQuestions}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Questions;