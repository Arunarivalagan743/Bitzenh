import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import { apiFetch } from '../api/client';
import './SearchResults.css';

const SearchResults = () => {
  const location = useLocation();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Current search criteria from URL
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [currentLevel, setCurrentLevel] = useState('');
  const [currentTag, setCurrentTag] = useState('');

  // Parse URL parameters and perform search when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    const language = params.get('language') || '';
    const level = params.get('level') || '';
    const tag = params.get('tag') || '';
    
    console.log('URL params parsed:', { q, language, level, tag });
    
    // Update current search state for display
    setCurrentSearch(q);
    setCurrentLanguage(language);
    setCurrentLevel(level);
    setCurrentTag(tag);
    
    // Perform search with current parameters
    performSearch(q, language, level, tag);
  }, [location.search]);

  const performSearch = async (search = '', language = '', level = '', tag = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (language) params.append('language', language);
      if (level) params.append('level', level);
      if (tag) params.append('tag', tag);

      const query = params.toString() ? `?${params.toString()}` : '';
      console.log('Performing search with query:', query);
      
      const data = await apiFetch(`/questions${query}`);
      console.log('Search results:', data?.length || 0, 'questions');
      
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error searching questions:', err);
      setError(err.message || 'Failed to search questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionUpdate = (questionId, updatedQuestion) => {
    setQuestions(questions.map(q => q._id === questionId ? updatedQuestion : q));
  };

  const handleQuestionDelete = (questionId) => {
    setQuestions(questions.filter(q => q._id !== questionId));
  };

  return (
    <div className="search-results-page">
    
       
        
         
        
        
     
   

      <div className="search-results">
      

        {error && (
          <div className="error-state">
            <p className="error-message">⚠️ {error}</p>
            <button onClick={() => performSearch(currentSearch, currentLanguage, currentLevel, currentTag)} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {questions.length > 0 ? (
              <>
               

                <div className="questions-grid">
                  {questions.map(question => (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      onUpdate={handleQuestionUpdate}
                      onDelete={handleQuestionDelete}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="no-results">
                {currentSearch || currentLanguage || currentLevel || currentTag ? (
                  <>
                    <h2>No questions found</h2>
                    <p>Try different search terms or use the search in the navigation bar</p>
                  </>
                ) : (
                  <>
                    <h2>Start searching</h2>
                    <p>Use the search bar in the navigation to find questions</p>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;