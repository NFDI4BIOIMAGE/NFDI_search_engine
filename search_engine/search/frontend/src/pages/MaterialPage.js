import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/style.css';
import bgSearchbar from '../assets/images/bg-searchbar.jpg';
import FilterCard from '../components/FilterCard';
import ResultsBox from '../components/ResultsBox';
import Pagination from '../components/Pagination';
import PagesSelection from '../components/PagesSelection';
import { Spinner } from 'react-bootstrap';

const MaterialPage = () => {
  const [materials, setMaterials] = useState([]);
  const [facets, setFacets] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState({ min: null, max: null });

  useEffect(() => {
    const savedFilters = JSON.parse(localStorage.getItem('selectedFilters'));
    if (savedFilters) {
      setSelectedFilters(savedFilters);
    }

    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/materials', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract unique materials based on 'url'
        const uniqueMaterials = Array.from(
          data.reduce((map, material) => {
            if (material.url && !map.has(material.url)) {
              map.set(material.url, material);
            }
            return map;
          }, new Map()).values()
        );

        setMaterials(uniqueMaterials);
        generateFacets(uniqueMaterials);
        setHasLoaded(true);
      } catch (err) {
        console.error('Error fetching the materials data:', err);
        setError(
          'An error occurred while fetching materials. Please try again later.'
        );
        setHasLoaded(true);
      }
    };

    fetchData();
  }, []);

  const generateFacets = (data) => {
    const authors = {};
    const licenses = {};
    const types = {};
    const tags = {};
    const publicationDates = {};
    const submissionDates = {};

    const currentYear = new Date().getFullYear();
    let minYear = currentYear;

    data.forEach((item) => {
      // Authors
      if (Array.isArray(item.authors)) {
        item.authors.forEach((author) => {
          authors[author] = (authors[author] || 0) + 1;
        });
      }

      // Licenses
      (Array.isArray(item.license)
        ? item.license
        : [item.license]?.filter(Boolean)
      ).forEach((license) => {
        licenses[license] = (licenses[license] || 0) + 1;
      });

      // Types
      (Array.isArray(item.type)
        ? item.type
        : [item.type]?.filter(Boolean)
      ).forEach((t) => {
        types[t] = (types[t] || 0) + 1;
      });

      // Tags
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }

      // Publication Dates
      const pubDate = item.publication_date;
      let year = null;

      if (typeof pubDate === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(pubDate)) {
          year = parseInt(pubDate.split('-')[0], 10);
        } else if (/^\d{4}$/.test(pubDate)) {
          year = parseInt(pubDate, 10);
        } else {
          const parsedDate = new Date(pubDate);
          if (!isNaN(parsedDate)) year = parsedDate.getFullYear();
        }
      } else if (typeof pubDate === 'number') {
        year = pubDate;
      }

      if (year && year >= 1900 && year <= currentYear) {
        publicationDates[year] = (publicationDates[year] || 0) + 1;
        minYear = Math.min(minYear, year);
      }

      // Submission Dates
      if (item.submission_date) {
        const submissionDate = item.submission_date.split('T')[0];
        submissionDates[submissionDate] =
          (submissionDates[submissionDate] || 0) + 1;
      }
    });

    setDateRange((prev) => ({
      ...prev,
      min: Object.keys(publicationDates).length > 0 ? minYear : prev.min,
      max: currentYear,
    }));

    const mapToArray = (obj, keyName = 'key') =>
      Object.entries(obj).map(([key, doc_count]) => ({
        [keyName]: key,
        doc_count,
      }));

    setFacets({
      authors: mapToArray(authors),
      licenses: mapToArray(licenses),
      types: mapToArray(types),
      tags: mapToArray(tags),
      publication_dates: Object.entries(publicationDates).map(([year, count]) => ({
        year: parseInt(year, 10),
        count,
      })),
      submission_dates: mapToArray(submissionDates),
    });
  };

  const handleFilter = (field, value) => {
    setSelectedFilters((prev) => {
      const updatedFilters = { ...prev };
      const fieldValues = updatedFilters[field] ?? [];
      updatedFilters[field] = fieldValues.includes(value)
        ? fieldValues.filter((v) => v !== value)
        : [...fieldValues, value];

      localStorage.setItem('selectedFilters', JSON.stringify(updatedFilters));
      return updatedFilters;
    });
  };

  const handleDateRangeChange = (field, range) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [field]: range,
    }));
  };

  const filteredMaterials = materials.filter((material) =>
    Object.keys(selectedFilters).every((field) => {
      const filters = selectedFilters[field] ?? [];
      const { publication_date: pubDate, submission_date: subDate } = material;

      if (field === 'publication_date' && pubDate) {
        const selectedRange = filters;
        const currentYear = new Date().getFullYear();
        const publicationYear =
          typeof pubDate === 'string'
            ? parseInt(pubDate.split('-')[0] ?? '', 10)
            : typeof pubDate === 'number'
            ? pubDate
            : null;

        if (publicationYear > currentYear) return false;

        if (
          !selectedRange ||
          (selectedRange[0] === dateRange.min && selectedRange[1] === dateRange.max)
        ) {
          return true;
        }

        return (
          publicationYear >= selectedRange[0] && publicationYear <= selectedRange[1]
        );
      }

      if (field === 'submission_date' && subDate) {
        const materialSubmissionDate = subDate.split('T')[0];
        return filters.length === 0 || filters.includes(materialSubmissionDate);
      }

      if (filters.length === 0) return true;

      const fieldValue = material[field];
      return filters.some((filterValue) =>
        Array.isArray(fieldValue)
          ? fieldValue.includes(filterValue)
          : fieldValue === filterValue
      );
    })
  );

  const highlightFields = Object.keys(selectedFilters)
    .filter((field) => !['publication_date', 'submission_date'].includes(field))
    .flatMap((field) => selectedFilters[field]);

  const indexOfLastMaterial = currentPage * itemsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - itemsPerPage;
  const currentMaterials = filteredMaterials.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
  const handleItemsPerPageChange = (numItems) => {
    setItemsPerPage(numItems);
    setCurrentPage(1);
  };

  // Destructure facets with default values for convenience
  const {
    authors = [],
    licenses = [],
    types = [],
    tags = [],
    publication_dates = [],
    submission_dates = []
  } = facets;

  // Helper function to render filter cards
  const renderFilterCard = (title, items, field, extraProps = {}) =>
    items.length > 0 && (
      <FilterCard
        title={title}
        items={items}
        field={field}
        selectedFilters={selectedFilters}
        handleFilter={handleFilter}
        {...extraProps}
      />
    );

  return (
    <div>
      <div
        className="container-fluid py-5 mb-5 searchbar-header"
        style={{
          position: 'relative',
          backgroundImage: `url(${bgSearchbar})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
          }}
        ></div>
        <div
          className="container py-5"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div className="row justify-content-center py-5">
            <div className="col-lg-10 pt-lg-5 mt-lg-5 text-center">
              <h1 className="display-3 text-white mb-3 animated slideInDown">
                Materials
              </h1>
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
                {renderFilterCard("Licenses", licenses, "license")}
                {renderFilterCard("Authors", authors, "authors")}
                {renderFilterCard("Types", types, "type")}
                {renderFilterCard("Tags", tags, "tags")}
                {renderFilterCard("Publication Date", publication_dates, "publication_date", {
                  dateRange,
                  onDateRangeChange: handleDateRangeChange,
                  publicationData: publication_dates,
                  minYear: dateRange.min,
                })}
                {renderFilterCard("Submission Date", submission_dates, "submission_date")}
              </>
            ) : (
              <p>No filters available.</p>
            )}
          </div>

          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p>
                Showing {indexOfFirstMaterial + 1} to{' '}
                {Math.min(indexOfLastMaterial, filteredMaterials.length)} of{' '}
                {filteredMaterials.length} materials
              </p>
              <PagesSelection
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>

            {!hasLoaded && (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Loading materials...</p>
              </div>
            )}

            {hasLoaded && error && <p className="text-danger">{error}</p>}

            {hasLoaded && !error && (
              <>
                <div className="materials-list">
                  {currentMaterials.length > 0 ? (
                    currentMaterials.map((material, index) => (
                      <ResultsBox
                        key={index}
                        title={material.name}
                        url={material.url}
                        authors={material.authors}
                        description={material.description}
                        license={material.license}
                        type={material.type}
                        tags={material.tags}
                        highlights={highlightFields}
                      />
                    ))
                  ) : (
                    <p>No materials found with the current filters.</p>
                  )}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialPage;
