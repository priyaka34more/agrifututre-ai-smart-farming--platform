import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import '../styles/premium-theme.css';

// 🌿 Premium Animated Search Box Component
const PremiumSearchBox = ({ 
  onSearch, 
  placeholder = 'Search crops, weather, markets...', 
  className = '',
  suggestions = []
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // 🌿 Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      setIsLoading(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await onSearch(query);
          setFilteredSuggestions(results || []);
        } catch (error) {
          console.error('Search error:', error);
          setFilteredSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } else {
      setIsLoading(false);
      setFilteredSuggestions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, onSearch]);

  // 🌿 Filter suggestions based on query
  useEffect(() => {
    if (query.trim() && suggestions.length > 0) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, suggestions]);

  // 🌿 Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  // 🌿 Handle focus
  const handleFocus = () => {
    setIsFocused(true);
    if (query.trim()) {
      setShowSuggestions(true);
    }
  };

  // 🌿 Handle blur
  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  // 🌿 Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  // 🌿 Handle clear
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // 🌿 Handle search submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`animated-search-box ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Input */}
        <div className="relative flex items-center">
          {/* Search Icon */}
          <div className="absolute left-4 z-10">
            {isLoading ? (
              <Loader2 size={20} className="animate-spin text-green-500" />
            ) : (
              <Search size={20} className="text-gray-400" />
            )}
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 border-2 border-transparent rounded-full bg-white/80 backdrop-blur-md text-gray-800 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:bg-white focus:shadow-lg transition-all duration-300"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 z-10 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              <X size={16} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 premium-glass-card rounded-xl overflow-hidden z-50">
            <div className="p-2">
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-500/10 transition-colors duration-200 flex items-center space-x-2"
                >
                  <Search size={16} className="text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Focus Ring Effect */}
        {isFocused && (
          <div className="absolute inset-0 rounded-full border-2 border-green-500/30 pointer-events-none animate-pulse"></div>
        )}
      </form>

      {/* Search Status */}
      {isLoading && (
        <div className="mt-2 text-center text-sm text-gray-500">
          Searching...
        </div>
      )}
    </div>
  );
};

export default PremiumSearchBox;
