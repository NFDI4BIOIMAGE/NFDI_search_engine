import React, { useEffect, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const PublicationDateSlider = ({ minYear, maxYear, onDateRangeChange, selectedRange }) => {
  const [range, setRange] = useState(selectedRange || [minYear, maxYear]);

  useEffect(() => {
    setRange(selectedRange || [minYear, maxYear]);
  }, [minYear, maxYear, selectedRange]);

  const handleRangeChange = (value) => {
    setRange(value);
    onDateRangeChange(value);
  };

  return (
    <div className="publication-date-slider">
      <h5>Publication Date Range</h5>
      <Slider
        range
        min={minYear}
        max={maxYear}
        value={range}
        onChange={handleRangeChange}
        allowCross={false}
      />
      <div className="range-labels" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
        <span>{range[0]}</span>
        <span>{range[1]}</span>
      </div>
    </div>
  );
};

export default PublicationDateSlider;
