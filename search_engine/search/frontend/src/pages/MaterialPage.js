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
  const [dateRange, setDateRange] = useState({ min: 2000, max: 2024 }); 

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

        const uniqueMaterialsMap = new Map();
        data.forEach(material => {
          if (material.url && !uniqueMaterialsMap.has(material.url)) {
            uniqueMaterialsMap.set(material.url, material);
          }
        });

        const uniqueMaterials = Array.from(uniqueMaterialsMap.values());

        setMaterials(uniqueMaterials);
        generateFacets(uniqueMaterials);
        setHasLoaded(true);
      } catch (error) {
        console.error("Error fetching the materials data:", error);
        setError("An error occurred while fetching materials. Please try again later.");
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
    const submitDates = {};
    let minYear = new Date().getFullYear();
    let maxYear = 2000;
  
    data.forEach((item) => {
      if (Array.isArray(item.authors)) {
        item.authors.forEach(author => {
          authors[author] = (authors[author] || 0) + 1;
        });
      }
  
      if (item.license) {
        const licenseArray = Array.isArray(item.license) ? item.license : [item.license];
        licenseArray.forEach(license => {
          licenses[license] = (licenses[license] || 0) + 1;
        });
      }
  
      if (item.type) {
        const typeArray = Array.isArray(item.type) ? item.type : [item.type];
        typeArray.forEach(type => {
          types[type] = (types[type] || 0) + 1;
        });
      }
  
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
  
      if (item.publication_date) {
        // Check if publication_date is a string and can be split, or if it's a Date object
        const year = typeof item.publication_date === 'string' 
          ? parseInt(item.publication_date.split('-')[0], 10)
          : new Date(item.publication_date).getFullYear();
  
        publicationDates[year] = (publicationDates[year] || 0) + 1;
        minYear = Math.min(minYear, year);
        maxYear = Math.max(maxYear, year);
      }
  
      if (item.submit_date) {
        const submitYear = item.submit_date.split('-')[0];
        submitDates[submitYear] = (submitDates[submitYear] || 0) + 1;
      }
    });
  
    setDateRange({ min: minYear, max: maxYear });
    setFacets({
      authors: Object.keys(authors).map(key => ({ key, doc_count: authors[key] })),
      licenses: Object.keys(licenses).map(key => ({ key, doc_count: licenses[key] })),
      types: Object.keys(types).map(key => ({ key, doc_count: types[key] })),
      tags: Object.keys(tags).map(key => ({ key, doc_count: tags[key] })),
      publication_dates: Object.keys(publicationDates).map(key => ({ key, doc_count: publicationDates[key] })),
      submit_dates: Object.keys(submitDates).map(key => ({ key, doc_count: submitDates[key] })),
    });
  };
  

  const handleFilter = (field, value) => {
    const updatedFilters = { ...selectedFilters };
    if (updatedFilters[field]?.includes(value)) {
      updatedFilters[field] = updatedFilters[field].filter(item => item !== value);
    } else {
      updatedFilters[field] = [...(updatedFilters[field] || []), value];
    }
    setSelectedFilters(updatedFilters);
    localStorage.setItem('selectedFilters', JSON.stringify(updatedFilters));
  };

  const handleDateRangeChange = (field, range) => {
    setSelectedFilters(prevFilters => ({
      ...prevFilters,
      [field]: range,
    }));
  };

  const filteredMaterials = materials.filter(material => {
    return Object.keys(selectedFilters).every(field => {
      if (field === 'publication_date' && material.publication_date) {
        // Check if publication_date is a string and can be split
        const publicationYear = typeof material.publication_date === 'string' 
          ? parseInt(material.publication_date.split('-')[0], 10)
          : new Date(material.publication_date).getFullYear();
  
        return (
          publicationYear >= selectedFilters[field][0] &&
          publicationYear <= selectedFilters[field][1]
        );
      }
  
      return selectedFilters[field]?.length === 0 || selectedFilters[field]?.some(filterValue => {
        return Array.isArray(material[field]) 
          ? material[field].includes(filterValue) 
          : material[field] === filterValue;
      });
    });
  });
  

  // const highlightFields = Object.values(selectedFilters).flat();
  const highlightFields = Object.keys(selectedFilters)
  .filter(field => field !== 'publication_date') // Exclude publication_date from highlights
  .map(field => selectedFilters[field])
  .flat();

  const indexOfLastMaterial = currentPage * itemsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - itemsPerPage;
  const currentMaterials = filteredMaterials.slice(indexOfFirstMaterial, indexOfLastMaterial);
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
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
              <h1 className="display-3 text-white mb-3 animated slideInDown">Materials</h1>
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
                <FilterCard title="Licenses" items={facets.licenses || []} field="license" selectedFilters={selectedFilters} handleFilter={handleFilter} />
                <FilterCard title="Authors" items={facets.authors || []} field="authors" selectedFilters={selectedFilters} handleFilter={handleFilter} />
                <FilterCard title="Types" items={facets.types || []} field="type" selectedFilters={selectedFilters} handleFilter={handleFilter} />
                <FilterCard title="Tags" items={facets.tags || []} field="tags" selectedFilters={selectedFilters} handleFilter={handleFilter} />
                
                {facets.publication_dates && (
                  <FilterCard
                    title="Publication Date"
                    items={facets.publication_dates}
                    field="publication_date"
                    selectedFilters={selectedFilters}
                    handleFilter={handleFilter}
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                  />
                )}
                {facets.submit_dates && (
                  <FilterCard title="Submit Date" items={facets.submit_dates} field="submit_date" selectedFilters={selectedFilters} handleFilter={handleFilter} />
                )}
              </>
            ) : (
              <p>No filters available.</p>
            )}
          </div>

          <div className="col-md-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <p>Showing {indexOfFirstMaterial + 1} to {indexOfLastMaterial > filteredMaterials.length ? filteredMaterials.length : indexOfLastMaterial} of {filteredMaterials.length} materials</p>
              <PagesSelection itemsPerPage={itemsPerPage} onItemsPerPageChange={handleItemsPerPageChange} />
            </div>

            {hasLoaded ? (
              error ? (
                <p className="text-danger">{error}</p>
              ) : (
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
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </>
              )
            ) : (
              <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Loading materials...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialPage;
