import React, { useState, useRef, useEffect } from 'react';
import PublicationDateSlider from './PublicationDateSlider';
import { format } from 'date-fns';

const FilterCard = ({
  title,
  items = [],
  field,
  selectedFilters = {},
  handleFilter,
  dateRange,
  onDateRangeChange,
  publicationData,
  minYear,
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef(null);

  // Sort items based on field
  const sortedItems = items
    .filter(({ key }) => key !== undefined)
    .sort((a, b) => {
      if (field === 'submission_date') return new Date(a.key) - new Date(b.key);
      if (field === 'publication_date') return a.year - b.year;
      return typeof a.key === 'string' && typeof b.key === 'string'
        ? a.key.localeCompare(b.key)
        : a.key - b.key;
    });

  const displayedItems = showAll ? sortedItems : sortedItems.slice(0, 5);

  useEffect(() => {
    // Reset `showAll` and `collapsed` only when `items` change
    setShowAll(false);
    setCollapsed(true);
  }, [items]);
  
  useEffect(() => {
    // Dynamically adjust container height based on `collapsed` and `showAll` states
    containerRef.current.style.maxHeight = collapsed ? '0' : `${containerRef.current.scrollHeight}px`;
  }, [collapsed, showAll]);
  
  const handleToggle = () => setCollapsed((prev) => !prev);

  const renderLabel = (item) => {
    if (field === 'submission_date') return format(new Date(item.key), 'yyyy-MM-dd');
    if (field === 'publication_date') return item.year;
    return item.key;
  };

  return (
    <div className="faceted-search">
      <div
        className={`faceted-search-header ${collapsed ? 'collapsed' : ''}`}
        onClick={handleToggle}
      >
        {title}
        <span className="filter-arrow">▶</span>
      </div>
      <div
        ref={containerRef}
        className={`faceted-search-body ${collapsed ? '' : 'show'}`}
      >
        {field === 'publication_date' && dateRange ? (
          <PublicationDateSlider
            minYear={minYear}
            onDateRangeChange={(range) => onDateRangeChange(field, range)}
            selectedRange={selectedFilters[field]}
            publicationData={publicationData}
          />
        ) : (
          <>
            <ul>
              {displayedItems.map((item) => (
                <li key={item.key}>
                  <input
                    type="checkbox"
                    checked={selectedFilters[field]?.includes(item.key) || false}
                    onChange={() => handleFilter(field, item.key)}
                  />
                  <label className={selectedFilters[field]?.includes(item.key) ? 'highlighted' : ''}>
                    {renderLabel(item)} ({item.doc_count || item.count})
                  </label>
                </li>
              ))}
            </ul>
            {items.length > 5 && field !== 'publication_date' && (
              <div className="show-more" onClick={() => setShowAll((prev) => !prev)}>
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
