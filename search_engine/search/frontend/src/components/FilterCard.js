import React, { useState, useRef, useEffect } from 'react';
import PublicationDateSlider from './PublicationDateSlider';

const FilterCard = ({ title, items = [], field, selectedFilters = {}, handleFilter, dateRange, onDateRangeChange, publicationData }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef(null);

  // Sort items alphabetically by their key, only if the key exists
  const sortedItems = items
    .filter(item => item.key !== undefined) // Ensure the key is defined
    .sort((a, b) => a.key.localeCompare(b.key));

  const displayedItems = showAll ? sortedItems : sortedItems.slice(0, 5);

  useEffect(() => {
    setShowAll(false);
    setCollapsed(true);
  }, [items]);

  useEffect(() => {
    if (collapsed) {
      containerRef.current.style.maxHeight = '0';
    } else {
      containerRef.current.style.maxHeight = containerRef.current.scrollHeight + 'px';
    }
  }, [collapsed, showAll]);

  return (
    <div className="faceted-search">
      <div
        className={`faceted-search-header ${collapsed ? 'collapsed' : ''}`}
        onClick={() => setCollapsed(!collapsed)}
      >
        {title}
        <span className="filter-arrow">▶</span>
      </div>
      <div ref={containerRef} className={`faceted-search-body ${collapsed ? '' : 'show'}`}>
        {field === 'publication_date' && dateRange ? (
          // Only render the PublicationDateSlider if dateRange is provided
          <PublicationDateSlider
            minYear={dateRange.min}
            maxYear={dateRange.max}
            onDateRangeChange={(range) => onDateRangeChange(field, range)}
            selectedRange={selectedFilters[field]}
            publicationData={publicationData}
          />
        ) : (
          // Render other fields as a list with "Show More" functionality
          <>
            <ul>
              {displayedItems.map(item => (
                <li key={item.key}>
                  <input
                    type="checkbox"
                    checked={selectedFilters[field]?.includes(item.key) || false}
                    onChange={() => handleFilter(field, item.key)}
                  />
                  <label
                    className={selectedFilters[field]?.includes(item.key) ? 'highlighted' : ''}
                  >
                    {item.key} ({item.doc_count})
                  </label>
                </li>
              ))}
            </ul>
            {/* Only show "Show More" if there are hidden items and field is not publication_date */}
            {items.length > 5 && field !== 'publication_date' && (
              <div className="show-more" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'Show Less' : `Show More (${items.length - 5})`}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FilterCard;
