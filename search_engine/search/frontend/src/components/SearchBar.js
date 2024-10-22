import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  // Get the backend URL from environment variables
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';  // Fallback if not set

  const handleSearch = (searchQuery) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim() !== '') {
      onSearch(finalQuery);
      navigate(`/search?q=${finalQuery}`);
      setSuggestions([]);  // Clear suggestions after search
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // Function to highlight query in suggestions with custom class
  const highlightQuery = (text, query) => {
    if (!query) return text;  // If no query, return the original text

    const parts = text.split(new RegExp(`(${query})`, 'gi'));  // Split by query, case-insensitive
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? <span key={index} className="suggestion_list_mark">{part}</span> : part
    );
  };

  // Fetch suggestions as the user types
  useEffect(() => {
    if (query.trim() !== '') {
      axios
        .get(`${backendUrl}/api/suggest?q=${query}`)  // Use the correct backend URL here
        .then((response) => {
          setSuggestions(response.data);
        })
        .catch((error) => {
          console.error('Error fetching suggestions:', error);
        });
    } else {
      setSuggestions([]); // Clear suggestions if the query is empty
    }
  }, [query, backendUrl]);

  return (
    <div className="position-relative">
      <input
        type="text"
        className="form-control border-0 rounded-pill w-100 py-3 ps-4 pe-5"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Eg: Machine Learning, Data Science, etc."
        style={{ paddingRight: '120px' }}
      />
      <button
        type="button"
        className="btn btn-primary rounded-pill py-2 px-4 position-absolute top-0 end-0 me-2"
        style={{ marginTop: '7px', right: '10px' }}
        onClick={() => handleSearch()}
      >
        Search
      </button>
      {suggestions.length > 0 && (
        <ul className="suggestion-list">
          {suggestions.map((suggestion, index) => (
            <li 
              key={index} 
              onClick={() => {
                handleSearch(suggestion.name);  // Pass suggestion to handleSearch
                setSuggestions([]);  // Clear suggestions when one is clicked
              }}
            >
              <span>{highlightQuery(suggestion.name || suggestion.description, query)}</span> {/* Highlight the matched part */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
