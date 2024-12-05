import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import FilterCard from '../components/FilterCard';
import Pagination from '../components/Pagination';
import PagesSelection from '../components/PagesSelection';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/style.css';
import bgSearchbar from '../assets/images/bg-searchbar.jpg';

const SearchResultsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const query = queryParams.get('q') || '';
  const exactMatch = queryParams.get('exact_match') === 'true';

  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [facets, setFacets] = useState({ authors: [], types: [], tags: [], licenses: [], publication_dates: [], submission_dates: [] });

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

  useEffect(() => {
    setSelectedFilters({});
  }, [query]);

  useEffect(() => {
    if (query) {
      axios
        .get(`${backendUrl}/api/search?q=${encodeURIComponent(query)}&exact_match=${exactMatch}`)
        .then((response) => {
          setResults(response.data);
          setHasSearched(true);

          const authors = {};
          const licenses = {};
          const types = {};
          const tags = {};
          const publicationDates = {};
          const submissionDates = {};

          response.data.forEach((item) => {
            const source = item._source;

            if (Array.isArray(source.authors)) {
              source.authors.forEach((author) => {
                authors[author] = (authors[author] || 0) + 1;
              });
            }

            const licenseArray = Array.isArray(source.license) ? source.license : [source.license];
            licenseArray.forEach((license) => {
              licenses[license] = (licenses[license] || 0) + 1;
            });

            const typeArray = Array.isArray(source.type) ? source.type : [source.type];
            typeArray.forEach((type) => {
              types[type] = (types[type] || 0) + 1;
            });

            if (Array.isArray(source.tags)) {
              source.tags.forEach((tag) => {
                tags[tag] = (tags[tag] || 0) + 1;
              });
            }

            if (source.publication_date) {
              const year = source.publication_date.toString().split('-')[0];
              publicationDates[year] = (publicationDates[year] || 0) + 1;
            }

            if (source.submission_date) {
              // Extract the full date in 'YYYY-MM-DD' format
              const submissionDate = source.submission_date.split('T')[0];
              submissionDates[submissionDate] = (submissionDates[submissionDate] || 0) + 1;
            }
          });

          setFacets({
            authors: Object.keys(authors).map((key) => ({ key, doc_count: authors[key] })),
            licenses: Object.keys(licenses).map((key) => ({ key, doc_count: licenses[key] })),
            types: Object.keys(types).map((key) => ({ key, doc_count: types[key] })),
            tags: Object.keys(tags).map((key) => ({ key, doc_count: tags[key] })),
            publication_dates: Object.keys(publicationDates).map((key) => ({
              key,
              doc_count: publicationDates[key],
            })),
            submission_dates: Object.keys(submissionDates).map((key) => ({
              key,
              doc_count: submissionDates[key],
            })),
          });
        })
        .catch((error) => {
          console.error('Error fetching search results:', error);
        });
    }
  }, [query, exactMatch, backendUrl]);

  const handleFilter = (field, key) => {
    setSelectedFilters((prevFilters) => {
      const currentSelections = prevFilters[field] || [];

      if (currentSelections.includes(key)) {
        return {
          ...prevFilters,
          [field]: currentSelections.filter((item) => item !== key),
        };
      } else {
        return {
          ...prevFilters,
          [field]: [...currentSelections, key],
        };
      }
    });
  };

  const correctFieldName = (field) => {
    switch (field) {
      case 'types':
        return 'type';
      case 'licenses':
        return 'license';
      case 'publication_dates':
        return 'publication_date';
      case 'submission_dates':
        return 'submission_date';
      default:
        return field;
    }
  };

  const filteredResults = results.filter((result) => {
    return Object.keys(selectedFilters).every((field) => {
      if (!selectedFilters[field].length) return true;

      const actualField = correctFieldName(field);
      const resultField = result._source?.[actualField] || result[actualField];

      if (!resultField) return false;

      if (field === 'publication_dates' && resultField) {
        const publicationYear = resultField.toString().split('-')[0];
        return selectedFilters[field].includes(publicationYear);
      }

      if (field === 'submission_dates' && resultField) {
        const submissionDate = resultField.toString().split('T')[0]; // Extract 'YYYY-MM-DD'
        return selectedFilters[field].includes(submissionDate);
      }

      if (Array.isArray(resultField)) {
        return selectedFilters[field].some((filter) => resultField.includes(filter));
      } else if (typeof resultField === 'string') {
        return selectedFilters[field].includes(resultField);
      } else {
        return false;
      }
    });
  });

  const indexOfLastResult = currentPage * itemsPerPage;
  const indexOfFirstResult = indexOfLastResult - itemsPerPage;
  const currentResults = filteredResults.slice(indexOfFirstResult, indexOfLastResult);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (numItems) => {
    setItemsPerPage(numItems);
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="container-fluid py-5 mb-5 searchbar-header" style={{ position: 'relative', backgroundImage: `url(${bgSearchbar})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.1)' }}></div>
        <div className="container py-5" style={{ position: 'relative', zIndex: 1 }}>
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white mb-3 animated slideInDown">Search Results</h1>
              <div className="position-relative w-75 mx-auto animated slideInDown">
                <SearchBar onSearch={(query) => { /* Handle search */ }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        <div className="row">
          <div className="col-md-3">
            <h3>Filter by</h3>
            {Object.keys(facets).length > 0 ? (
              <>
                <FilterCard title="Licenses" items={facets.licenses || []} field="licenses" selectedFilters={selectedFilters} handleFilter={handleFilter} />
                <FilterCard title="Authors" items={facets.authors || []} field="authors" selectedFilters={selectedFilters} handleFilter={handleFilter} />
                <FilterCard title="Types" items={facets.types || []} field="types" selectedFilters={selectedFilters} handleFilter={handleFilter} />
                <FilterCard title="Tags" items={facets.tags || []} field="tags" selectedFilters={selectedFilters} handleFilter={handleFilter} />

                {facets.publication_dates && (
                  <FilterCard title="Publication Date" items={facets.publication_dates} field="publication_dates" selectedFilters={selectedFilters} handleFilter={handleFilter} />
                )}
                {facets.submission_dates && (
                  <FilterCard title="Submission Date" items={facets.submission_dates} field="submission_dates" selectedFilters={selectedFilters} handleFilter={handleFilter} />
                )}
              </>
            ) : (
              <p>No filters available.</p>
            )}
          </div>

          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p>
                Showing {indexOfFirstResult + 1} to{' '}
                {indexOfLastResult > filteredResults.length ? filteredResults.length : indexOfLastResult} of{' '}
                {filteredResults.length} results
              </p>
              <PagesSelection itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} />
            </div>

            <SearchResults results={currentResults} hasSearched={hasSearched} query={query} selectedFilters={selectedFilters} />

            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
