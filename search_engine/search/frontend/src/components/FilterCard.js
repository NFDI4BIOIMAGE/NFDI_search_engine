import React, { useState, useRef, useEffect } from 'react';
import PublicationDateSlider from './PublicationDateSlider';

const FilterCard = ({ title, items = [], field, selectedFilters = {}, handleFilter, dateRange, onDateRangeChange }) => {
  const [collapsed, setCollapsed] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const containerRef = useRef(null);

  // Sort items alphabetically by their key before displaying
  const sortedItems = items.sort((a, b) => a.key.localeCompare(b.key));
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
        {field === 'publication_date' ? (
          <PublicationDateSlider
            minYear={dateRange.min}
            maxYear={dateRange.max}
            onDateRangeChange={(range) => onDateRangeChange(field, range)}
            selectedRange={selectedFilters[field]}
          />
        ) : (
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
        )}
        {items.length > 5 && (
          <div className="show-more" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show Less' : `Show More (${items.length - 5})`}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterCard;
